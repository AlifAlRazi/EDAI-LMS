import connectDB from "./mongodb";
import KnowledgeNode from "@/models/KnowledgeNode";
import KnowledgeEdge from "@/models/KnowledgeEdge";
import OpenAI from "openai";
import type { GraphData, IKnowledgeNode, QuizAnswer, GapAnalysisResult } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Builds a React Flow compatible graph structure for a given course.
 */
export async function buildCourseGraph(courseId: string): Promise<GraphData> {
  await connectDB();

  const nodes = await KnowledgeNode.find({ courseId }).lean();
  const nodeIds = nodes.map(n => n.nodeId);
  const edges = await KnowledgeEdge.find({ 
    from: { $in: nodeIds },
    to: { $in: nodeIds }
  }).lean();

  return {
    nodes: nodes.map(n => ({
      id: n.nodeId,
      position: { x: Math.random() * 500, y: Math.random() * 500 }, // Initial layout; usually overriden by UI layout engine
      data: {
        label: n.label,
        nodeId: n.nodeId,
        difficulty: n.difficulty,
      },
    })),
    edges: edges.map(e => ({
      id: `${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      type: "smoothstep",
      animated: e.type === "prerequisite",
    })),
  };
}

export interface DetectGapParams {
  userId: string;
  courseId: string;
  quizAnswers: QuizAnswer[];
}

/**
 * Core Algorithm: Analyzes wrong answers, traces prerequisites,
 * and generates a topologically sorted learning path to fill gaps.
 */
export async function detectKnowledgeGaps(params: DetectGapParams): Promise<GapAnalysisResult> {
  await connectDB();
  const { courseId, quizAnswers } = params;

  // 1. Identify raw nodes where the student failed
  const failedNodeIds = quizAnswers
    .filter(a => typeof a.isCorrect !== "undefined" ? !a.isCorrect : false)
    .map(a => a.knowledgeNodeId);

  const passedNodeIds = quizAnswers
    .filter(a => a.isCorrect)
    .map(a => a.knowledgeNodeId);

  // 2. Fetch full nodes to trace prerequisites
  const allNodes = await KnowledgeNode.find({ courseId }).lean() as unknown as IKnowledgeNode[];
  const nodeMap = new Map(allNodes.map(n => [n.nodeId, n]));

  const rawGapNodes = new Set<string>();
  const gapQueue = [...failedNodeIds];

  // 3. Graph Traversal: If you fail a node, we must check if you also failed its prerequisites.
  // Wait, if a node failed, we assume the gap is at THIS node.
  // Actually, standard gap detection recursively includes prerequisites if we haven't verified them as passed.
  while (gapQueue.length > 0) {
    const currentId = gapQueue.shift()!;
    if (rawGapNodes.has(currentId) || passedNodeIds.includes(currentId)) continue;
    
    rawGapNodes.add(currentId);
    
    const node = nodeMap.get(currentId);
    if (node?.prerequisites) {
      // Add prerequisites to the queue to check
      gapQueue.push(...node.prerequisites);
    }
  }

  const gapNodesList = Array.from(rawGapNodes).map(id => nodeMap.get(id)!).filter(Boolean);
  const strongNodesList = passedNodeIds.map(id => nodeMap.get(id)!).filter(Boolean);

  // 4. Generate Recommended Path (Topological Sort of Gap Nodes)
  const recommendedPath = generateRecommendedPath(Array.from(rawGapNodes), allNodes);

  const result: GapAnalysisResult = {
    gapNodes: gapNodesList,
    strongNodes: strongNodesList,
    recommendedPath,
    explanation: "", // Will be filled below
  };

  // 5. Generate human-readable explanation via LLM
  result.explanation = await explainGapAnalysis(result);

  return result;
}

/**
 * Topologically sorts the gap nodes so prerequisites are taught first.
 */
export function generateRecommendedPath(gapNodeIds: string[], allNodes: IKnowledgeNode[]): string[] {
  const nodeMap = new Map(allNodes.map(n => [n.nodeId, n]));
  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(nodeId: string) {
    if (visited.has(nodeId) || !gapNodeIds.includes(nodeId)) return;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (node && node.prerequisites) {
      for (const req of node.prerequisites) {
        dfs(req);
      }
    }
    result.push(nodeId);
  }

  for (const id of gapNodeIds) {
    dfs(id);
  }

  return result; // Prerequisites will naturally appear first in the post-order DFS result
}

/**
 * Calls OpenAI to explain the gap analysis in a friendly, encouraging way.
 */
export async function explainGapAnalysis(gapResult: GapAnalysisResult): Promise<string> {
  const gapLabels = gapResult.gapNodes.map(n => n.label).join(", ");
  const strongLabels = gapResult.strongNodes.map(n => n.label).join(", ");

  const prompt = `You are an AI learning coach. The student just took a diagnostic test.
They did well on: ${strongLabels || "none specifically tested yet"}.
They need to work on the following gaps: ${gapLabels}.

Write a short, encouraging 2-3 sentence explanation directly to the student explaining what they should focus on and why we are recommending they start there. Be extremely brief, friendly, and clear.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use mini for speed and cost as it's a simple text task
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });
    return completion.choices[0].message.content || "Keep up the good work! Follow your personalized path to Master these topics.";
  } catch (error) {
    console.error("OpenAI Gap Explanation Error:", error);
    return "We've built a personalized path for you based on your results. Follow the path to master these concepts!";
  }
}
