import { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

export const revalidate = 3600; // rebuild sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic course routes
  try {
    await connectDB();
    const courses = await Course.find({ isPublished: true })
      .select("slug updatedAt")
      .lean() as any[];

    const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
      url: `${baseUrl}/courses/${c.slug}`,
      lastModified: new Date(c.updatedAt ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...courseRoutes];
  } catch {
    return staticRoutes;
  }
}
