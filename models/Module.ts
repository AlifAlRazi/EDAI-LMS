import mongoose, { Document, Model, Schema } from "mongoose";
import type { LessonType } from "@/types";

// ─── Sub-document interfaces ───────────────────────────────────────────────────

export interface ILessonDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: LessonType;
  content: string;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
}

// ─── Main Module document interface ───────────────────────────────────────────

export interface IModuleDocument extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  lessons: ILessonDocument[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const LessonSchema = new Schema<ILessonDocument>(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["video", "document", "text"] satisfies LessonType[],
      required: [true, "Lesson type is required"],
    },
    /**
     * For video/document: Cloudinary URL
     * For text: Rich markdown content
     */
    content: {
      type: String,
      default: "",
    },
    cloudinaryPublicId: { type: String },
    cloudinaryUrl: { type: String },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ModuleSchema = new Schema<IModuleDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    lessons: {
      type: [LessonSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

/** Total duration of all lessons in this module (minutes) */
ModuleSchema.virtual("totalDuration").get(function () {
  return this.lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
});

/** Count of lessons in this module */
ModuleSchema.virtual("lessonCount").get(function () {
  return this.lessons.length;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

ModuleSchema.index({ courseId: 1, order: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Module: Model<IModuleDocument> =
  mongoose.models.Module ??
  mongoose.model<IModuleDocument>("Module", ModuleSchema);

export default Module;
