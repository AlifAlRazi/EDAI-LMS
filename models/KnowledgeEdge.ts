import mongoose, { Document, Model, Schema } from "mongoose";

// ─── KnowledgeEdge ────────────────────────────────────────────────────────────

/**
 * Represents a directed prerequisite relationship between two knowledge nodes.
 * `from` → `to` means "node `from` is a prerequisite of `to`"
 */
export interface IKnowledgeEdgeDocument extends Document {
  /** The source node (prerequisite) nodeId */
  from: string;
  /** The target node (depends on source) nodeId */
  to: string;
  /**
   * Edge type — enables different relationship semantics:
   * - "prerequisite": strict dependency
   * - "related": soft association
   * - "extends": builds directly upon
   */
  type: "prerequisite" | "related" | "extends";
  /** Optional weight for graph algorithms (0-1) */
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeEdgeSchema = new Schema<IKnowledgeEdgeDocument>(
  {
    from: {
      type: String,
      required: [true, "Source node ID is required"],
      ref: "KnowledgeNode",
    },
    to: {
      type: String,
      required: [true, "Target node ID is required"],
      ref: "KnowledgeNode",
    },
    type: {
      type: String,
      enum: ["prerequisite", "related", "extends"],
      default: "prerequisite",
    },
    weight: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

KnowledgeEdgeSchema.index({ from: 1, to: 1 }, { unique: true });
KnowledgeEdgeSchema.index({ from: 1 });
KnowledgeEdgeSchema.index({ to: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const KnowledgeEdge: Model<IKnowledgeEdgeDocument> =
  mongoose.models.KnowledgeEdge ??
  mongoose.model<IKnowledgeEdgeDocument>("KnowledgeEdge", KnowledgeEdgeSchema);

export default KnowledgeEdge;
