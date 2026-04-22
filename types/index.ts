/**
 * Shared TypeScript types for EdAI LMS
 */

// ─── Auth & Users ─────────────────────────────────────────────────────────────

export type UserRole = "student" | "instructor" | "admin";

export interface LearnerProfile {
  completedNodes: string[];
  weakNodes: string[];
  strongNodes: string[];
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  enrolledCourses: EnrolledCourse[];
  learnerProfile: LearnerProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrolledCourse {
  courseId: string | Record<string, unknown>;
  enrolledAt: Date;
  completedAt?: Date;
  stripePaymentId?: string;
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface CoursePrerequisite {
  courseId: string;
  description: string;
}

export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  instructor: string | IUser;
  price: number;
  isFree: boolean;
  category: string;
  level: CourseLevel;
  prerequisites: CoursePrerequisite[];
  knowledgeNodes: string[];
  modules: string[] | IModule[];
  totalDuration: number;
  enrollmentCount: number;
  isPublished: boolean;
  stripePriceId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Modules & Lessons ────────────────────────────────────────────────────────

export type LessonType = "video" | "document" | "text";

export interface ILesson {
  _id: string;
  title: string;
  type: LessonType;
  content: string;
  cloudinaryPublicId?: string;
  duration?: number;
  order: number;
}

export interface IModule {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: ILesson[];
}

// ─── Knowledge Graph ──────────────────────────────────────────────────────────

export type NodeDifficulty = "foundational" | "intermediate" | "advanced";

export interface IKnowledgeNode {
  _id: string;
  nodeId: string;
  label: string;
  courseId: string;
  prerequisites: string[];
  description: string;
  difficulty: NodeDifficulty;
}

export interface IKnowledgeEdge {
  from: string;
  to: string;
  type: string;
}

/** React Flow compatible graph data */
export interface GraphData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  data: {
    label: string;
    nodeId: string;
    difficulty: NodeDifficulty;
    status?: "gap" | "strong" | "current" | "default";
  };
  position: { x: number; y: number };
  type?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────

export type QuizType = "diagnostic" | "in-lesson" | "final";
export type QuestionType = "mcq" | "true-false";

export interface IQuestion {
  _id: string;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  knowledgeNodeId: string;
  difficulty: string;
}

export interface IQuiz {
  _id: string;
  courseId: string;
  nodeId?: string;
  type: QuizType;
  title: string;
  questions: IQuestion[];
  isAIGenerated: boolean;
  createdAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  knowledgeNodeId: string;
  isCorrect?: boolean;
}

// ─── Enrollments & Progress ───────────────────────────────────────────────────

export type EnrollmentStatus = "active" | "completed" | "paused";

export interface DiagnosticResult {
  completedAt: Date;
  score: number;
  totalQuestions: number;
  gapNodes: string[];
  strongNodes: string[];
  recommendedPath: string[];
}

export interface LessonProgress {
  lessonId: string;
  completedAt: Date;
  timeSpent: number;
}

export interface QuizAttempt {
  quizId: string | Record<string, unknown>;
  score: number;
  answers: QuizAnswer[];
  completedAt: Date;
}

export interface IEnrollment {
  _id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  stripeSessionId?: string;
  stripePaymentId?: string;
  diagnosticResult?: DiagnosticResult;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  currentLessonId?: string;
  completionPercentage: number;
  enrolledAt: Date;
  completedAt?: Date;
}

// ─── RAG & Gap Analysis ───────────────────────────────────────────────────────

export interface GapAnalysisResult {
  gapNodes: IKnowledgeNode[];
  strongNodes: IKnowledgeNode[];
  recommendedPath: string[];
  explanation: string;
}

export interface RAGContext {
  text: string;
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  score: number;
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: RAGContext[];
  createdAt: Date;
}

// NextAuth module augmentation is in types/next-auth.d.ts
