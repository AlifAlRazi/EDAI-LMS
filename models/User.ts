import mongoose, { Document, Model, Schema } from "mongoose";
import type { UserRole, LearnerProfile, EnrolledCourse } from "@/types";

// ─── Sub-document interfaces ───────────────────────────────────────────────────

export interface IEnrolledCourse extends EnrolledCourse, Document {}

export interface ILearnerProfile extends LearnerProfile {}

// ─── Main User document interface ─────────────────────────────────────────────

export interface IUserDocument extends Document {
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  enrolledCourses: EnrolledCourse[];
  learnerProfile: LearnerProfile;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const EnrolledCourseSchema = new Schema<EnrolledCourse>(
  {
    courseId: {
      type: Schema.Types.Mixed,
      ref: "Course",
      required: true,
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    stripePaymentId: { type: String },
  },
  { _id: false }
);

const LearnerProfileSchema = new Schema<LearnerProfile>(
  {
    completedNodes: { type: [String], default: [] },
    weakNodes: { type: [String], default: [] },
    strongNodes: { type: [String], default: [] },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"] satisfies UserRole[],
      default: "student",
    },
    enrolledCourses: {
      type: [EnrolledCourseSchema],
      default: [],
    },
    learnerProfile: {
      type: LearnerProfileSchema,
      default: () => ({
        completedNodes: [],
        weakNodes: [],
        strongNodes: [],
      }),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ "enrolledCourses.courseId": 1 });

// ─── Model (singleton with hot-reload guard) ──────────────────────────────────

const User: Model<IUserDocument> =
  mongoose.models.User ??
  mongoose.model<IUserDocument>("User", UserSchema);

export default User;
