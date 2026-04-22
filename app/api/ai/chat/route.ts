import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkEnrollment } from "@/lib/check-enrollment";
import { queryRAG } from "@/lib/rag";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId, lessonId, message, conversationHistory = [] } = await req.json();

    if (!courseId || !message) {
      return new NextResponse("courseId and message are required", { status: 400 });
    }

    // Verify the user is enrolled in this course
    const enrolled = await checkEnrollment(session.user.id, courseId);
    if (!enrolled) {
      return new NextResponse("Forbidden: Not enrolled in this course", { status: 403 });
    }

    // Step 1: Fetch RAG context — semantic search against course's Pinecone namespace
    let contextChunks: { text: string; lessonTitle: string; lessonId: string; score: number }[] = [];
    let sources: { lessonTitle: string; chunk: string }[] = [];

    try {
      contextChunks = await queryRAG({ courseId, query: message, topK: 5 });
      sources = contextChunks
        .filter((c) => c.score > 0.3)
        .map((c) => ({ lessonTitle: c.lessonTitle, chunk: c.text.slice(0, 120) + "…" }));
    } catch {
      // If Pinecone isn't configured, we proceed without context
      contextChunks = [];
    }

    const contextText = contextChunks.length
      ? contextChunks.map((c) => `[Source: ${c.lessonTitle}]\n${c.text}`).join("\n\n---\n\n")
      : null;

    // Step 2: Build the system prompt
    const systemPrompt = contextText
      ? `You are an AI tutor for an online course. Answer the student's question ONLY using the provided course material context below. If you cannot find the answer in the context, say so honestly.

Be concise, clear, and encouraging. When referencing content, mention the source lesson title.

--- COURSE MATERIAL CONTEXT ---
${contextText}
--- END CONTEXT ---`
      : `You are an AI tutor for an online course. The course knowledge base is not yet indexed, so answer based on your general knowledge. Be concise, clear, and educational.`;

    // Step 3: Build the messages array from conversation history
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Step 4: Stream the response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      stream: true,
      temperature: 0.6,
      max_tokens: 600,
    });

    // Step 5: Stream back to client using ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullReply = "";

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          fullReply += delta;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
        }

        // Send sources after the stream ends
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, sources })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AI_CHAT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
