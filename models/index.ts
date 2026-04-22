/**
 * Central barrel file for all Mongoose models.
 * Import models from here to ensure they are registered
 * before any queries are run.
 *
 * @example
 * import { User, Course, Enrollment } from "@/models";
 */

export { default as User } from "./User";
export { default as Course } from "./Course";
export { default as Module } from "./Module";
export { default as KnowledgeNode } from "./KnowledgeNode";
export { default as KnowledgeEdge } from "./KnowledgeEdge";
export { default as Quiz } from "./Quiz";
export { default as Enrollment } from "./Enrollment";

// Re-export document interfaces for use in API routes and server actions
export type { IUserDocument } from "./User";
export type { ICourseDocument } from "./Course";
export type { IModuleDocument, ILessonDocument } from "./Module";
export type { IKnowledgeNodeDocument } from "./KnowledgeNode";
export type { IKnowledgeEdgeDocument } from "./KnowledgeEdge";
export type { IQuizDocument, IQuestionDocument } from "./Quiz";
export type { IEnrollmentDocument } from "./Enrollment";
