import { ImageResponse } from "next/og";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

export const runtime = "nodejs";
export const alt = "EdAI LMS Course";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const course = await Course.findOne({ slug: params.slug, isPublished: true })
      .select("title description category price isFree thumbnail instructor")
      .lean() as any;

    const title = course?.title ?? "EdAI LMS";
    const description = course?.description?.slice(0, 100) ?? "AI-Powered Personalized Learning";
    const category = course?.category ?? "Course";
    const price = course?.isFree ? "Free" : course?.price ? `$${(course.price / 100).toFixed(2)}` : "";
    const thumbnail = course?.thumbnail ?? null;

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            background: "linear-gradient(135deg, #0a0a0f 0%, #1a0533 50%, #0d0d1a 100%)",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background thumbnail (blurred) */}
          {thumbnail && (
            <img
              src={thumbnail}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.07,
                filter: "blur(20px)",
              }}
            />
          )}

          {/* Left gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(10,10,15,0.98) 40%, rgba(10,10,15,0.6) 100%)",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "60px 70px",
              width: "100%",
            }}
          >
            {/* Top: Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                ⚡
              </div>
              <span style={{ color: "white", fontSize: "22px", fontWeight: 800 }}>EdAI LMS</span>
            </div>

            {/* Middle: Course info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Category badge */}
              <div
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  color: "#a78bfa",
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {category}
              </div>

              <div
                style={{
                  color: "white",
                  fontSize: title.length > 40 ? "44px" : "56px",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  maxWidth: "700px",
                }}
              >
                {title}
              </div>

              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "20px",
                  maxWidth: "600px",
                  lineHeight: 1.4,
                }}
              >
                {description}
              </div>
            </div>

            {/* Bottom: Price + tag */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {price && (
                <div
                  style={{
                    color: price === "Free" ? "#4ade80" : "#fbbf24",
                    fontSize: "28px",
                    fontWeight: 800,
                  }}
                >
                  {price}
                </div>
              )}
              <div
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "16px",
                }}
              >
                AI-Powered · Knowledge Graph · Personalized
              </div>
            </div>
          </div>

          {/* Right: Thumbnail */}
          {thumbnail && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "420px",
                height: "630px",
                display: "flex",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, rgba(10,10,15,1) 0%, transparent 40%)",
                  zIndex: 1,
                }}
              />
              <img
                src={thumbnail}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    // Fallback OG image
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            background: "linear-gradient(135deg, #0a0a0f, #1a0533)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "48px",
            fontWeight: 900,
            fontFamily: "sans-serif",
          }}
        >
          ⚡ EdAI LMS
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
