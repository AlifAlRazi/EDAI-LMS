import mongoose, { Document, Model, Schema } from "mongoose";
import type { NodeDifficulty } from "@/types";

// ─── KnowledgeNode ────────────────────────────────────────────────────────────

export interface IKnowledgeNodeDocument extends Document {
  /** Unique slug used for graph traversal, e.g. "linear-algebra/eigenvalues" */
  nodeId: string;
  /** Human-readable display label */
  label: string;
  /** The course this concept belongs to */
  courseId: mongoose.Types.ObjectId;
  /** Array of nodeIds this node directly depends on */
  prerequisites: string[];
  /** Brief description of the concept */
  description: string;
  /** Concept difficulty level */
  difficulty: NodeDifficulty;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeNodeSchema = new Schema<IKnowledgeNodeDocument>(
  {
    nodeId: {
      type: String,
      required: [true, "Node ID is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-/]+$/,
        "Node ID can only contain lowercase letters, numbers, hyphens and slashes",
      ],
    },
    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    difficulty: {
      type: String,
      enum: ["foundational", "intermediate", "advanced"] satisfies NodeDifficulty[],
      default: "foundational",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

KnowledgeNodeSchema.index({ nodeId: 1 }, { unique: true });
KnowledgeNodeSchema.index({ courseId: 1 });
KnowledgeNodeSchema.index({ courseId: 1, difficulty: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const KnowledgeNode: Model<IKnowledgeNodeDocument> =
  mongoose.models.KnowledgeNode ??
  mongoose.model<IKnowledgeNodeDocument>("KnowledgeNode", KnowledgeNodeSchema);

export default KnowledgeNode;
