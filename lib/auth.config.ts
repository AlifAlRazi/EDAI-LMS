import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

/**
 * NextAuth configuration using JWT strategy.
 * No MongoDB adapter — user data is stored in our custom User model
 * and baked into the JWT token on every sign-in.
 */
export const authOptions: NextAuthOptions = {
  // No adapter — we manage User documents ourselves
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,   // 30 days
    updateAge: 24 * 60 * 60,      // re-issue every 24h
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * Runs on every sign-in. Upserts the user document so we always
     * have a record in our own User collection.
     */
    async signIn({ user }) {
      try {
        await connectDB();
        const result = await User.findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: {
              name: user.name ?? "Learner",
              email: user.email,
              image: user.image ?? null,
              role: "student",
              enrolledCourses: [],
              learnerProfile: {
                completedNodes: [],
                weakNodes: [],
                strongNodes: [],
              },
            },
          },
          { upsert: true, new: false, runValidators: false } // new:false → returns null if inserted new
        );

        // If result is null, it means a new user was just created → send welcome email
        if (!result) {
          // Fire-and-forget, don't block sign-in
          import("@/lib/email").then(({ sendWelcomeEmail }) => {
            sendWelcomeEmail({ name: user.name, email: user.email }).catch(console.error);
          });
        }

        return true;
      } catch (err) {
        console.error("[SIGNIN_ERROR]", err);
        return false;
      }
    },


    /**
     * On first sign-in, fetch the user's _id and role from MongoDB
     * and bake them into the JWT so they're available on every request.
     */
    async jwt({ token, user }) {
      if (user) {
        // user is populated on first sign-in only
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email })
            .select("_id role image name")
            .lean() as any;
          token.id    = dbUser?._id?.toString() ?? user.id;
          token.role  = dbUser?.role ?? "student";
          token.image = dbUser?.image ?? user.image;
          token.name  = dbUser?.name ?? user.name;
        } catch {
          token.id   = user.id;
          token.role = "student";
        }
      }
      return token;
    },

    /**
     * Expose the JWT fields to the session object so client
     * and server components can read them via useSession / getSession.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id    = token.id as string;
        session.user.role  = token.role as "student" | "instructor" | "admin";
        if (token.name)  session.user.name  = token.name  as string;
        if (token.email) session.user.email = token.email as string;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
};
