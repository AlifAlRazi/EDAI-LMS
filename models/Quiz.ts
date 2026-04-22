import mongoose, { Document, Model, Schema } from "mongoose";
import type { QuizType, QuestionType } from "@/types";

// ─── Sub-document interfaces ───────────────────────────────────────────────────

export interface IQuestionDocument {
  _id: mongoose.Types.ObjectId;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  knowledgeNodeId: string;
  difficulty: string;
  order: number;
}

// ─── Main Quiz document interface ─────────────────────────────────────────────

export interface IQuizDocument extends Document {
  courseId: mongoose.Types.ObjectId;
  /** Optional: linked to a specific knowledge node */
  nodeId?: string;
  type: QuizType;
  title: string;
  questions: IQuestionDocument[];
  isAIGenerated: boolean;
  /** If AI-generated, instructor must approve before going live */
  isApproved: boolean;
  /** Total time limit in minutes (0 = no limit) */
  timeLimitMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const QuestionSchema = new Schema<IQuestionDocument>(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["mcq", "true-false"] satisfies QuestionType[],
      default: "mcq",
    },
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: function (v: string[]) {
          return v.length >= 2 && v.length <= 4;
        },
        message: "Questions must have between 2 and 4 options",
      },
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
    },
    explanation: {
      type: String,
      default: "",
    },
    knowledgeNodeId: {
      type: String,
      required: [true, "Knowledge node ID is required"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const QuizSchema = new Schema<IQuizDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    nodeId: {
      type: String,
      ref: "KnowledgeNode",
    },
    type: {
      type: String,
      enum: ["diagnostic", "in-lesson", "final"] satisfies QuizType[],
      required: [true, "Quiz type is required"],
    },
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
      validate: {
        validator: function (v: IQuestionDocument[]) {
          return v.length <= 50;
        },
        message: "A quiz cannot exceed 50 questions",
      },
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    timeLimitMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

QuizSchema.virtual("questionCount").get(function () {
  return this.questions.length;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

QuizSchema.index({ courseId: 1, type: 1 });
QuizSchema.index({ nodeId: 1 });
QuizSchema.index({ isAIGenerated: 1, isApproved: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Quiz: Model<IQuizDocument> =
  mongoose.models.Quiz ??
  mongoose.model<IQuizDocument>("Quiz", QuizSchema);

export default Quiz;
