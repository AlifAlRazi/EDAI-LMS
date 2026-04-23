import OpenAI from "openai";
import { getPineconeIndex } from "./pinecone";
import { nanoid } from "nanoid";
import type { IQuestion } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

/**
 * Generates an embedding vector for the provided text using OpenAI's small embedding model.
 */
export async function embedDocument(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.replace(/\n/g, " "),
  });
  return response.data[0].embedding;
}

/**
 * Splits a large document into smaller overlapping chunks.
 * Standardizes text retrieval granularity for RAG capabilities.
 * @param chunkSize approximate character length per chunk
 * @param overlap character length overlap between adjacent chunks
 */
export function chunkDocument(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.slice(index, index + chunkSize));
    index += chunkSize - overlap;
  }
  return chunks;
}

export interface UpsertParams {
  courseId: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  text: string;
}

/**
 * Chunks, embeds, and upserts lesson documents into the Pinecone Vector DB.
 * Uses a course-specific namespace for fast filtering during queries.
 */
export async function upsertDocumentToPinecone(params: UpsertParams) {
  const { courseId, moduleId, lessonId, lessonTitle, text } = params;
  const chunks = chunkDocument(text);
  const index = getPineconeIndex();

  const vectors = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await embedDocument(chunk);
      return {
        id: `chunk_${nanoid()}`,
        values: embedding,
        metadata: {
          courseId,
          moduleId,
          lessonId,
          lessonTitle,
          text: chunk, // Storing original text in metadata is required for RAG
        },
      };
    })
  );

  // Batch upsert to the specific course namespace
  await index.namespace(`course:${courseId}`).upsert(vectors as any);
  return vectors.length;
}

export interface QueryParams {
  courseId: string;
  query: string;
  topK?: number;
}

/**
 * RAG Context Fetcher. Takes a query, embeds it, and semantic-searches
 * the course namespace for the most relevant document chunks.
 */
export async function queryRAG({ courseId, query, topK = 5 }: QueryParams) {
  const queryEmbedding = await embedDocument(query);
  const index = getPineconeIndex();

  const results = await index.namespace(`course:${courseId}`).query({
    topK,
    vector: queryEmbedding,
    includeMetadata: true,
  });

  return results.matches.map((match) => ({
    text: match.metadata?.text as string,
    lessonId: match.metadata?.lessonId as string,
    lessonTitle: match.metadata?.lessonTitle as string,
    moduleId: match.metadata?.moduleId as string,
    score: match.score ?? 0,
  }));
}

export interface AdaptiveQuestionParams {
  courseId: string;
  nodeId: string;
  difficulty: string;
  topic: string;
}

/**
 * Core AI Generation: Uses RAG context to formulate a high-quality,
 * pedagogically sound multiple-choice or true/false question.
 */
export async function generateAdaptiveQuestion(params: AdaptiveQuestionParams): Promise<Partial<IQuestion>> {
  const { courseId, nodeId, difficulty, topic } = params;

  // 1. Fetch relevant context from Pinecone
  const contextMatches = await queryRAG({
    courseId,
    query: `Concepts regarding ${topic}`,
    topK: 3,
  });

  const contextText = contextMatches
    .map((m) => `[Source: ${m.lessonTitle}]\n${m.text}`)
    .join("\n\n");

  // 2. Instruct GPT-4o to generate structured JSON output
  const systemPrompt = `You are a strict, expert university professor creating a rigorous assessment.
Generate a single multiple-choice question deeply testing the student's conceptual mastery of: "${topic}".
Difficulty level: ${difficulty}.

CRITICAL INSTRUCTIONS:
1. Do NOT make lame, obvious, or generic questions.
2. The question MUST be highly specific to the course material provided.
3. Require the student to apply knowledge, solve a problem, or demonstrate deep understanding, rather than just reciting a definition.
4. If the course material context is missing or generic, invent a highly realistic, challenging scenario related to "${topic}".

Use the following course material as context to ensure accuracy and relevance:
---
${contextText || "[No specific course context found. Rely entirely on advanced academic knowledge of the topic.]"}
---

You MUST respond with ONLY valid JSON matching this exact structure:
{
  "questionText": "The text of the highly challenging question",
  "type": "mcq",
  "options": ["Plausible Distractor A", "Plausible Distractor B", "Plausible Distractor C", "Correct Answer"],
  "correctAnswer": "The exact string from options that is correct",
  "explanation": "Detailed academic explanation of why this answer is correct and others are fundamentally flawed"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const responseContent = completion.choices[0].message.content || "{}";
  const parsed = JSON.parse(responseContent);

  return {
    questionText: parsed.questionText,
    type: parsed.type || "mcq",
    options: parsed.options,
    correctAnswer: parsed.correctAnswer,
    explanation: parsed.explanation,
    knowledgeNodeId: nodeId,
    difficulty,
  };
}
