const mongoose = require('mongoose');

// Schema definitions (minimalist for seeding)
const CourseSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  instructor: mongoose.Schema.Types.ObjectId,
  price: Number,
  isFree: Boolean,
  category: String,
  level: String,
  isPublished: Boolean
}, { timestamps: true });

const EnrollmentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  courseId: mongoose.Schema.Types.ObjectId,
  status: String,
  completionPercentage: Number,
}, { timestamps: true });

const MONGODB_URI = "mongodb+srv://alif1212:alif1212@cluster0.f1hkf.mongodb.net/edaiLMS";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
    const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);

    const mockUserId = "60d5f2f1f1d1f1d1f1d1f1d1";
    
    const categories = ["AI", "Mathematics", "Web Development", "Business", "Data Science"];
    const levels = ["beginner", "intermediate", "advanced"];
    const adjs = ["Advanced", "Introduction to", "Mastering", "The Complete", "Modern"];
    const topics = ["Neural Networks", "Calculus", "React.js", "Entrepreneurship", "Python Data Analysis", "Growth Hacking", "Vector Databases", "Linear Algebra", "Node.js Architecture"];

    console.log("Generating 30 courses...");
    
    for (let i = 1; i <= 30; i++) {
      const topic = topics[i % topics.length];
      const adj = adjs[i % adjs.length];
      const title = `${adj} ${topic} ${i > topics.length ? `(Vol ${Math.ceil(i/topics.length)})` : ""}`;
      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[().]/g, '') + `-${i}`;
      
      const category = categories[i % categories.length];
      let thumbnail = "/images/courses/business.png";
      if (category === "AI") thumbnail = "/images/courses/ai.png";
      if (category === "Mathematics") thumbnail = "/images/courses/math.png";
      if (category === "Web Development") thumbnail = "/images/courses/web_dev.png";

      const courseData = {
        title,
        slug,
        description: `This is a comprehensive course on ${topic}. Deep dive into ${adj.toLowerCase()} concepts and industry best practices.`,
        instructor: new mongoose.Types.ObjectId(),
        price: Math.floor(Math.random() * 10000) + 1900, // $19 - $119
        isFree: Math.random() > 0.8,
        category,
        level: levels[i % levels.length],
        isPublished: true,
        thumbnail
      };

      await Course.findOneAndUpdate({ slug: courseData.slug }, courseData, { upsert: true, new: true });
      
      // Occasionally enroll the user in some
      if (i % 5 === 0) {
        await Enrollment.findOneAndUpdate(
          { userId: new mongoose.Types.ObjectId(mockUserId), courseId: (await Course.findOne({slug: courseData.slug}))._id },
          { 
            userId: new mongoose.Types.ObjectId(mockUserId), 
            courseId: (await Course.findOne({slug: courseData.slug}))._id,
            status: "active",
            completionPercentage: Math.floor(Math.random() * 100)
          },
          { upsert: true }
        );
      }
    }

    console.log("Seeding complete! 30 courses generated.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
