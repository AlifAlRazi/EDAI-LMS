import mongoose, { Document, Model, Schema } from "mongoose";
import type { CourseLevel, CoursePrerequisite } from "@/types";

// ─── Sub-document interface ────────────────────────────────────────────────────

export interface IPrerequisite extends CoursePrerequisite {}

// ─── Main Course document interface ───────────────────────────────────────────

export interface ICourseDocument extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  instructor: mongoose.Types.ObjectId;
  price: number;
  isFree: boolean;
  category: string;
  level: CourseLevel;
  prerequisites: CoursePrerequisite[];
  knowledgeNodes: any[];
  modules: any[];
  totalDuration: number;
  enrollmentCount: number;
  isPublished: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const PrerequisiteSchema = new Schema<CoursePrerequisite>(
  {
    courseId: {
      type: Schema.Types.Mixed,
      ref: "Course",
      required: true,
    },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const CourseSchema = new Schema<ICourseDocument>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    thumbnail: {
      type: String,
      default: "",
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"] satisfies CourseLevel[],
      default: "beginner",
    },
    prerequisites: {
      type: [PrerequisiteSchema],
      default: [],
    },
    knowledgeNodes: {
      type: [Object],
      default: [],
    },
    modules: {
      type: [Object],
      default: [],
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    stripePriceId: { type: String },
    stripeProductId: { type: String },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
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

/** Formatted price in dollars (price is stored in cents) */
CourseSchema.virtual("priceFormatted").get(function (this: ICourseDocument) {
  return this.isFree ? "Free" : `$${(this.price / 100).toFixed(2)}`;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

CourseSchema.index({ slug: 1 }, { unique: true });
CourseSchema.index({ isPublished: 1, category: 1 });
CourseSchema.index({ isPublished: 1, level: 1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ title: "text", description: "text", tags: "text" });

// Note: Slug generation is handled in the API route before saving.
// Use: course.slug = generateSlug(course.title) before course.save()

// ─── Model ────────────────────────────────────────────────────────────────────

delete mongoose.models.Course;
const Course: Model<ICourseDocument> = mongoose.model<ICourseDocument>("Course", CourseSchema);

export default Course;
