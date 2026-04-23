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
  modules: { type: [Object], default: [] },
  knowledgeNodes: { type: [Object], default: [] },
}, { timestamps: true });

const UserModel = mongoose.models.User ?? mongoose.model("User", userSchema);
const CourseModel = mongoose.models.Course ?? mongoose.model("Course", courseSchema);

// Helper data
const categories = ["Computer Science", "Mathematics", "Physics", "Data Science", "Design", "Business", "Marketing", "Psychology"];
const levels = ["beginner", "intermediate", "advanced"];
const adjectives = ["Advanced", "Introduction to", "Mastering", "Fundamentals of", "Applied", "Practical", "Complete", "Modern", "Essential"];
const topics = ["Algorithms", "Web Development", "Artificial Intelligence", "Quantum Mechanics", "Linear Algebra", "UX Design", "Digital Marketing", "Financial Accounting", "Cognitive Behavioral Therapy", "Machine Learning", "Data Structures", "Statistics", "Calculus", "Graphic Design", "Entrepreneurship"];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + getRandomInt(1000, 9999);
}

async function main() {
  console.log("🌱 Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected.");

  // Get Admin user to assign as instructor
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@edai.app";
  let admin = await UserModel.findOne({ email: adminEmail });
  
  if (!admin) {
    const hashedPw = await bcrypt.hash("EdAI@2025!", 12);
    admin = await UserModel.create({
      name: "EdAI Admin", email: adminEmail, password: hashedPw, role: "admin", enrolledCourses: []
    });
  }

  console.log(`👤 Assigned Instructor: ${adminEmail}`);

  const coursesToInsert = [];

  for (let i = 1; i <= 30; i++) {
    const adjective = adjectives[getRandomInt(0, adjectives.length - 1)];
    const topic = topics[getRandomInt(0, topics.length - 1)];
    const title = `${adjective} ${topic}`;
    const category = categories[getRandomInt(0, categories.length - 1)];
    const level = levels[getRandomInt(0, levels.length - 1)];
    const isFree = Math.random() > 0.8; // 20% free
    const price = isFree ? 0 : getRandomInt(1999, 9999); // $19.99 to $99.99
    
    // Modules and Lessons
    const modules = [];
    const knowledgeNodes = [];
    
    const numModules = getRandomInt(2, 5);
    let lessonCounter = 1;

    for (let m = 1; m <= numModules; m++) {
      const lessons = [];
      const numLessons = getRandomInt(2, 4);

      for (let l = 1; l <= numLessons; l++) {
        const lessonId = `l-${i}-${m}-${l}`;
        const nodeId = `n-${i}-${m}-${l}`;
        
        // Mix of videos and documents
        const isDoc = Math.random() > 0.5;
        const type = isDoc ? "document" : "video";
        const contentUrl = isDoc 
          ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
          : "https://www.w3schools.com/html/mov_bbb.mp4";

        lessons.push({
          id: lessonId,
          title: `Lesson ${lessonCounter}: Core Concepts of ${topic}`,
          type: type,
          content: isDoc ? contentUrl : "",
          videoUrl: isDoc ? "" : contentUrl,
          duration: getRandomInt(5, 25),
          knowledgeNodeId: nodeId
        });

        // Add corresponding Knowledge Node
        knowledgeNodes.push({
          id: nodeId,
          label: `Concept ${lessonCounter}`,
          difficulty: level,
          description: `Detailed explanation of concept ${lessonCounter} in ${topic}.`,
          prerequisites: lessonCounter > 1 ? [`n-${i}-${m}-${l-1}`] : [],
          lessonId: lessonId,
        });

        lessonCounter++;
      }

      modules.push({
        title: `Module ${m}: Deep Dive into ${topic}`,
        lessons: lessons
      });
    }

    coursesToInsert.push({
      title: title,
      slug: generateSlug(title),
      description: `This comprehensive course covers all the essential aspects of ${topic}. Suitable for ${level} students. You will learn practical applications and theoretical foundations.`,
      thumbnail: `https://picsum.photos/seed/${i * 100}/800/450`,
      category: category,
      level: level,
      price: price,
      isFree: isFree,
      isPublished: true, // Auto publish so they show up
      enrollmentCount: getRandomInt(0, 500),
      instructor: admin._id,
      modules: modules,
      knowledgeNodes: knowledgeNodes,
    });
  }

  console.log(`⏳ Inserting ${coursesToInsert.length} dummy courses...`);
  await CourseModel.insertMany(coursesToInsert);

  console.log(`🎉 Successfully inserted 30 courses!`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
