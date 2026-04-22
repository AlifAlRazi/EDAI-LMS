import mongoose, { Document, Model, Schema } from "mongoose";
import type { EnrollmentStatus, DiagnosticResult, LessonProgress, QuizAttempt, QuizAnswer } from "@/types";

// ─── Main Enrollment document interface ───────────────────────────────────────

export interface IEnrollmentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
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
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const QuizAnswerSchema = new Schema<QuizAnswer>(
  {
    questionId: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    knowledgeNodeId: { type: String, required: true },
    isCorrect: { type: Boolean },
  },
  { _id: false }
);

const DiagnosticResultSchema = new Schema<DiagnosticResult>(
  {
    completedAt: { type: Date, default: Date.now },
    score: { type: Number, required: true, min: 0, max: 100 },
    totalQuestions: { type: Number, required: true },
    gapNodes: { type: [String], default: [] },
    strongNodes: { type: [String], default: [] },
    recommendedPath: { type: [String], default: [] },
  },
  { _id: false }
);

const LessonProgressSchema = new Schema<LessonProgress>(
  {
    lessonId: {
      type: String,
      required: true,
    },
    completedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema<QuizAttempt>(
  {
    quizId: {
      type: Schema.Types.Mixed,
      ref: "Quiz",
      required: true,
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    answers: {
      type: [QuizAnswerSchema],
      default: [],
    },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EnrollmentSchema = new Schema<IEnrollmentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"] satisfies EnrollmentStatus[],
      default: "active",
    },
    stripeSessionId: { type: String },
    stripePaymentId: { type: String },
    diagnosticResult: {
      type: DiagnosticResultSchema,
      default: null,
    },
    lessonProgress: {
      type: [LessonProgressSchema],
      default: [],
    },
    quizAttempts: {
      type: [QuizAttemptSchema],
      default: [],
    },
    currentLessonId: { type: String },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

/** Whether the student has taken the diagnostic test */
EnrollmentSchema.virtual("hasDiagnostic").get(function () {
  return !!this.diagnosticResult;
});

/** Whether there are knowledge gaps to address */
EnrollmentSchema.virtual("hasGaps").get(function () {
  return (this.diagnosticResult?.gapNodes?.length ?? 0) > 0;
});

/** Number of lessons completed */
EnrollmentSchema.virtual("lessonsCompleted").get(function () {
  return this.lessonProgress.length;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ userId: 1, status: 1 });
EnrollmentSchema.index({ courseId: 1 });
EnrollmentSchema.index({ stripeSessionId: 1 });
EnrollmentSchema.index({ "diagnosticResult.gapNodes": 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Enrollment: Model<IEnrollmentDocument> =
  mongoose.models.Enrollment ??
  mongoose.model<IEnrollmentDocument>("Enrollment", EnrollmentSchema);

export default Enrollment;
