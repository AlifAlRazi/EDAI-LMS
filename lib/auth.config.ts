import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// ─── Singleton MongoClient for the adapter ────────────────────────────────────

const uri = process.env.MONGODB_URI!;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!uri) {
  // In build time (no MONGODB_URI), create a placeholder
  clientPromise = Promise.resolve(null as unknown as MongoClient);
} else if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

// ─── Exported authOptions ─────────────────────────────────────────────────────

/**
 * NextAuth configuration options.
 * Exported from lib/ (not the route file) so it can be imported
 * by getServerSession() calls throughout the app without causing
 * Next.js route-file type conflicts.
 */
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        try {
          await connectDB();
          const dbUser = await User.findById(user.id).select("role").lean();
          session.user.role = (dbUser as { role?: string })?.role as "student" | "instructor" | "admin" ?? "student";
        } catch {
          session.user.role = "student";
        }
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          await User.findOneAndUpdate(
            { email: user.email },
            { $setOnInsert: { role: "student" } },
            { upsert: true, new: true, runValidators: false }
          );
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
  },

  events: {
    async createUser({ user }) {
      try {
        await connectDB();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: {
              name: user.name ?? "Learner",
              email: user.email,
              image: user.image ?? null,
              role: "student",
              enrolledCourses: [],
              learnerProfile: { completedNodes: [], weakNodes: [], strongNodes: [] },
            },
          },
          { upsert: true, new: true, runValidators: false }
        );
      } catch (error) {
        console.error("Error creating User document:", error);
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
};
