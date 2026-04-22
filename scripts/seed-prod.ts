/**
 * EdAI LMS — Production Seed Script
 * Run: npx tsx scripts/seed-prod.ts
 *
 * Seeds:
 * - 1 admin user
 * - 3 categories (Mathematics, Computer Science, Physics)
 * - 2 full courses with modules, lessons, knowledge graph nodes
 * - Sample diagnostic quiz questions
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

// ─── Schemas (inline to avoid path issues) ────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  image: String, role: { type: String, default: "student" },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId }],
  learnerProfile: {
    completedNodes: [String], weakNodes: [String], strongNodes: [String],
  },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: String, slug: String, description: String, thumbnail: String,
  category: String, level: String, price: Number, isFree: Boolean,
  isPublished: Boolean, enrollmentCount: { type: Number, default: 0 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modules: [{
    title: String, lessons: [{
      id: String, title: String, type: String, content: String,
      videoUrl: String, duration: Number, knowledgeNodeId: String,
    }],
  }],
  knowledgeNodes: [{
    id: String, label: String, difficulty: String, description: String,
    prerequisites: [String], lessonId: String,
  }],
}, { timestamps: true });

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  type: { type: String, enum: ["diagnostic", "module", "final"] },
  title: String,
  questions: [{
    questionText: String, options: [String], correctAnswer: String,
    knowledgeNodeId: String, explanation: String,
  }],
}, { timestamps: true });

const UserModel = mongoose.models.User ?? mongoose.model("User", userSchema);
const CourseModel = mongoose.models.Course ?? mongoose.model("Course", courseSchema);
const QuizModel = mongoose.models.Quiz ?? mongoose.model("Quiz", quizSchema);

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected.");

  // 1. Admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@edai.app";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "EdAI@2025!";
  const hashedPw = await bcrypt.hash(adminPassword, 12);
  const admin = await UserModel.findOneAndUpdate(
    { email: adminEmail },
    { $setOnInsert: { name: "EdAI Admin", email: adminEmail, password: hashedPw, role: "admin", image: null, enrolledCourses: [], learnerProfile: { completedNodes: [], weakNodes: [], strongNodes: [] } } },
    { upsert: true, new: true }
  );
  console.log(`👤 Admin: ${adminEmail}`);

  // 2. Courses
  const courses = [
    {
      title: "Machine Learning Fundamentals",
      slug: "machine-learning-fundamentals",
      description: "Master the core concepts of machine learning — from linear regression to neural networks — with AI-powered gap detection and a personalized learning path.",
      thumbnail: "/images/courses/ai-1.png",
      category: "Artificial Intelligence",
      level: "beginner",
      price: 4999,
      isFree: false,
      isPublished: true,
      modules: [
        {
          title: "Introduction to ML",
          lessons: [
            { id: "ml-l1", title: "What is Machine Learning?", type: "video", content: "", duration: 8, knowledgeNodeId: "ml-intro" },
            { id: "ml-l2", title: "Types of Learning: Supervised vs Unsupervised", type: "video", content: "", duration: 12, knowledgeNodeId: "ml-types" },
            { id: "ml-l3", title: "The Bias-Variance Tradeoff", type: "document", content: "The bias-variance tradeoff is a central problem in supervised learning. Ideally, one wants to choose a model that accurately captures the regularities in its training data, but also generalizes well to unseen data.", duration: 10, knowledgeNodeId: "bias-variance" },
          ],
        },
        {
          title: "Core Algorithms",
          lessons: [
            { id: "ml-l4", title: "Linear Regression Deep Dive", type: "video", content: "", duration: 15, knowledgeNodeId: "linear-regression" },
            { id: "ml-l5", title: "Logistic Regression & Classification", type: "video", content: "", duration: 14, knowledgeNodeId: "logistic-regression" },
            { id: "ml-l6", title: "Decision Trees & Random Forests", type: "document", content: "Decision trees are a non-parametric supervised learning method used for classification and regression.", duration: 12, knowledgeNodeId: "decision-trees" },
          ],
        },
        {
          title: "Neural Networks",
          lessons: [
            { id: "ml-l7", title: "Perceptrons & Activation Functions", type: "video", content: "", duration: 18, knowledgeNodeId: "perceptrons" },
            { id: "ml-l8", title: "Backpropagation Explained", type: "video", content: "", duration: 20, knowledgeNodeId: "backprop" },
            { id: "ml-l9", title: "Building Your First Neural Network", type: "document", content: "In this lesson we implement a 3-layer neural network from scratch using NumPy.", duration: 25, knowledgeNodeId: "nn-implementation" },
          ],
        },
      ],
      knowledgeNodes: [
        { id: "ml-intro", label: "ML Introduction", difficulty: "beginner", description: "What machine learning is and why it matters.", prerequisites: [], lessonId: "ml-l1" },
        { id: "ml-types", label: "Learning Types", difficulty: "beginner", description: "Supervised, unsupervised, and reinforcement learning.", prerequisites: ["ml-intro"], lessonId: "ml-l2" },
        { id: "bias-variance", label: "Bias-Variance Tradeoff", difficulty: "intermediate", description: "Understanding overfitting and underfitting.", prerequisites: ["ml-types"], lessonId: "ml-l3" },
        { id: "linear-regression", label: "Linear Regression", difficulty: "beginner", description: "Modeling continuous outputs with a linear function.", prerequisites: ["ml-intro"], lessonId: "ml-l4" },
        { id: "logistic-regression", label: "Logistic Regression", difficulty: "intermediate", description: "Binary classification using the sigmoid function.", prerequisites: ["linear-regression"], lessonId: "ml-l5" },
        { id: "decision-trees", label: "Decision Trees", difficulty: "intermediate", description: "Tree-based models for classification and regression.", prerequisites: ["ml-types"], lessonId: "ml-l6" },
        { id: "perceptrons", label: "Perceptrons", difficulty: "intermediate", description: "The basic building block of neural networks.", prerequisites: ["linear-regression"], lessonId: "ml-l7" },
        { id: "backprop", label: "Backpropagation", difficulty: "advanced", description: "How neural networks learn via gradient descent.", prerequisites: ["perceptrons", "bias-variance"], lessonId: "ml-l8" },
        { id: "nn-implementation", label: "Neural Network Implementation", difficulty: "advanced", description: "Building a neural network from scratch.", prerequisites: ["backprop"], lessonId: "ml-l9" },
      ],
    },
    {
      title: "Calculus for Data Scientists",
      slug: "calculus-for-data-scientists",
      description: "Build the mathematical foundation needed for AI and ML — derivatives, integrals, gradients, and optimization with an AI tutor available at every step.",
      thumbnail: "/images/courses/math-1.png",
      category: "Mathematics",
      level: "intermediate",
      price: 3999,
      isFree: false,
      isPublished: true,
      modules: [
        {
          title: "Foundations of Calculus",
          lessons: [
            { id: "calc-l1", title: "Limits & Continuity", type: "video", content: "", duration: 10, knowledgeNodeId: "limits" },
            { id: "calc-l2", title: "Derivatives: The Rate of Change", type: "video", content: "", duration: 14, knowledgeNodeId: "derivatives" },
            { id: "calc-l3", title: "Chain Rule & Product Rule", type: "document", content: "The chain rule is a formula for computing the derivative of the composition of two or more functions.", duration: 12, knowledgeNodeId: "chain-rule" },
          ],
        },
        {
          title: "Multivariable Calculus",
          lessons: [
            { id: "calc-l4", title: "Partial Derivatives", type: "video", content: "", duration: 16, knowledgeNodeId: "partial-derivatives" },
            { id: "calc-l5", title: "Gradient & Gradient Descent", type: "video", content: "", duration: 20, knowledgeNodeId: "gradient" },
            { id: "calc-l6", title: "Jacobians & Hessians", type: "document", content: "The Jacobian matrix represents all first-order partial derivatives of a vector-valued function.", duration: 18, knowledgeNodeId: "jacobian" },
          ],
        },
      ],
      knowledgeNodes: [
        { id: "limits", label: "Limits", difficulty: "beginner", description: "The foundation of calculus.", prerequisites: [], lessonId: "calc-l1" },
        { id: "derivatives", label: "Derivatives", difficulty: "beginner", description: "Rates of change and slopes.", prerequisites: ["limits"], lessonId: "calc-l2" },
        { id: "chain-rule", label: "Chain Rule", difficulty: "intermediate", description: "Differentiating composite functions.", prerequisites: ["derivatives"], lessonId: "calc-l3" },
        { id: "partial-derivatives", label: "Partial Derivatives", difficulty: "intermediate", description: "Derivatives in multiple dimensions.", prerequisites: ["derivatives"], lessonId: "calc-l4" },
        { id: "gradient", label: "Gradient Descent", difficulty: "advanced", description: "Optimization via steepest descent.", prerequisites: ["partial-derivatives", "chain-rule"], lessonId: "calc-l5" },
        { id: "jacobian", label: "Jacobians & Hessians", difficulty: "advanced", description: "Higher-order derivative matrices.", prerequisites: ["gradient"], lessonId: "calc-l6" },
      ],
    },
  ];

  for (const courseData of courses) {
    const existing = await CourseModel.findOne({ slug: courseData.slug });
    if (existing) {
      console.log(`⏭ Course already exists: ${courseData.title}`);
      continue;
    }
    const course = await CourseModel.create({ ...courseData, instructor: admin._id });

    // Create diagnostic quiz for this course
    await QuizModel.create({
      courseId: course._id,
      type: "diagnostic",
      title: `${courseData.title} — Diagnostic Assessment`,
      questions: courseData.knowledgeNodes.slice(0, 6).map((node, i) => ({
        questionText: `Which of the following best describes "${node.label}"?`,
        options: [
          node.description ?? "The correct definition",
          "A type of unsupervised learning algorithm",
          "A mathematical optimization technique",
          "A data preprocessing method",
        ],
        correctAnswer: node.description ?? "The correct definition",
        knowledgeNodeId: node.id,
        explanation: `${node.label} is defined as: ${node.description}`,
      })),
    });

    console.log(`📚 Course created: ${courseData.title}`);
  }

  console.log("\n🎉 Seed complete!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
