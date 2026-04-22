import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "EdAI LMS <noreply@edai.app>";

// ─── Shared HTML shell ─────────────────────────────────────────────────────────

function emailShell(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EdAI LMS</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0533 0%,#0d0d1a 100%);border-radius:16px 16px 0 0;padding:32px 40px;border-bottom:1px solid rgba(124,58,237,0.2);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;">
                        <span style="color:#fff;font-size:20px;line-height:36px;padding:0 6px;">⚡</span>
                      </div>
                      <span style="color:#fff;font-size:22px;font-weight:800;vertical-align:middle;margin-left:8px;">EdAI</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#111118;padding:40px;border-left:1px solid rgba(255,255,255,0.04);border-right:1px solid rgba(255,255,255,0.04);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d1a;border-radius:0 0 16px 16px;padding:24px 40px;border:1px solid rgba(255,255,255,0.04);border-top:1px solid rgba(124,58,237,0.1);">
              <p style="margin:0;color:rgba(255,255,255,0.3);font-size:12px;text-align:center;">
                EdAI LMS — AI-powered personalized learning<br/>
                <a href="${process.env.NEXTAUTH_URL}/dashboard" style="color:#7c3aed;text-decoration:none;">Dashboard</a>
                &nbsp;·&nbsp;
                <a href="${process.env.NEXTAUTH_URL}/courses" style="color:#7c3aed;text-decoration:none;">Courses</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;margin-top:8px;">${label} →</a>`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 12px;color:#fff;font-size:28px;font-weight:800;line-height:1.25;">${text}</h1>`;
}

function body(text: string) {
  return `<p style="margin:0 0 20px;color:rgba(255,255,255,0.65);font-size:15px;line-height:1.7;">${text}</p>`;
}

function divider() {
  return `<div style="height:1px;background:rgba(255,255,255,0.06);margin:28px 0;"></div>`;
}

function badge(text: string, color = "#7c3aed") {
  return `<span style="display:inline-block;background:${color}22;color:${color};border:1px solid ${color}44;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:0.05em;">${text}</span>`;
}

// ─── 1. Welcome Email ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(user: {
  name?: string | null;
  email?: string | null;
}) {
  if (!user.email) return;

  const html = emailShell(`
    ${heading(`Welcome to EdAI, ${user.name?.split(" ")[0] ?? "Learner"}! 🎓`)}
    ${body("You've just joined the smarter way to learn. EdAI uses Knowledge Graphs and AI-powered diagnostics to detect exactly what you're missing — then builds a personalized learning path just for you.")}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${[
        { icon: "🔍", title: "Diagnostic Test", desc: "Start any course with a quick diagnostic to map your current knowledge." },
        { icon: "🧠", title: "Gap Detection AI", desc: "Our AI identifies exactly where your gaps are across your learning path." },
        { icon: "🗺️", title: "Personalized Paths", desc: "Get a custom learning path that skips what you know and focuses on what you don't." },
        { icon: "💬", title: "AI Tutor Chat", desc: "Ask questions about any lesson — the AI tutor answers using your course materials." },
      ].map(f => `
        <tr>
          <td style="padding:10px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:44px;vertical-align:top;">
                  <div style="width:40px;height:40px;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);border-radius:10px;text-align:center;line-height:40px;font-size:18px;">${f.icon}</div>
                </td>
                <td style="padding-left:14px;vertical-align:top;">
                  <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">${f.title}</p>
                  <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">${f.desc}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `).join("")}
    </table>
    ${primaryButton(`${process.env.NEXTAUTH_URL}/courses`, "Browse Courses")}
  `, "Your AI-powered learning journey starts now!");

  return resend.emails.send({
    from: FROM,
    to: user.email,
    subject: "Welcome to EdAI! Your learning journey starts now 🚀",
    html,
  });
}

// ─── 2. Enrollment Confirmation ────────────────────────────────────────────────

export async function sendEnrollmentConfirmation(
  user: { name?: string | null; email?: string | null },
  course: { title: string; slug: string; thumbnail?: string; price?: number; isFree?: boolean },
  enrollment: { _id: string; courseId: string }
) {
  if (!user.email) return;

  const html = emailShell(`
    ${badge("Enrollment Confirmed", "#22c55e")}
    <div style="height:16px;"></div>
    ${heading(`You're enrolled in "${course.title}"!`)}
    ${body(`Hi ${user.name?.split(" ")[0] ?? "there"}, your enrollment is confirmed. Your next step is to take the AI Diagnostic Test so we can map your knowledge and build a personalized learning path.`)}
    ${course.thumbnail ? `<img src="${course.thumbnail}" alt="${course.title}" style="width:100%;border-radius:12px;margin-bottom:24px;display:block;" />` : ""}
    ${divider()}
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;width:100%;">
      <tr>
        <td style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:16px 20px;">
          <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Amount Paid</p>
          <p style="margin:6px 0 0;color:#fff;font-size:24px;font-weight:800;">${course.isFree ? "Free" : `$${((course.price ?? 0) / 100).toFixed(2)}`}</p>
        </td>
      </tr>
    </table>
    ${primaryButton(`${process.env.NEXTAUTH_URL}/learn/${enrollment.courseId}/quiz/diagnostic`, "Start Diagnostic Test")}
  `, `You're enrolled in ${course.title}!`);

  return resend.emails.send({
    from: FROM,
    to: user.email,
    subject: `You're enrolled in "${course.title}"! 🎉`,
    html,
  });
}

// ─── 3. Gap Analysis Report ────────────────────────────────────────────────────

export async function sendGapAnalysisReport(
  user: { name?: string | null; email?: string | null },
  course: { title: string; _id: string },
  gapResult: {
    score: number;
    totalQuestions?: number;
    gapNodes: string[];
    strongNodes: string[];
    recommendedPath: string[];
    explanation?: string;
  }
) {
  if (!user.email) return;

  const html = emailShell(`
    ${badge("Knowledge Gap Report", "#f59e0b")}
    <div style="height:16px;"></div>
    ${heading(`Your Gap Report: ${course.title}`)}
    ${body(`Hi ${user.name?.split(" ")[0] ?? "there"}, your diagnostic test results are in. Here's a breakdown of what our AI found.`)}

    <!-- Score Block -->
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(79,70,229,0.1));border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:20px 24px;text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Diagnostic Score</p>
          <p style="margin:8px 0;color:#fff;font-size:42px;font-weight:900;">${gapResult.score}%</p>
          <p style="margin:0;color:rgba(255,255,255,0.4);font-size:12px;">${gapResult.totalQuestions ?? gapResult.gapNodes.length + gapResult.strongNodes.length} questions</p>
        </td>
      </tr>
    </table>

    ${gapResult.explanation ? `
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="background:rgba(79,70,229,0.08);border-left:3px solid #7c3aed;border-radius:0 8px 8px 0;padding:14px 18px;">
          <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;font-style:italic;">"${gapResult.explanation}"</p>
          <p style="margin:8px 0 0;color:rgba(124,58,237,0.8);font-size:11px;font-weight:700;">— EdAI Analysis</p>
        </td>
      </tr>
    </table>` : ""}

    ${divider()}

    ${gapResult.gapNodes.length > 0 ? `
    <p style="margin:0 0 10px;color:#f87171;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">⚠ Knowledge Gaps (${gapResult.gapNodes.length})</p>
    <div style="margin-bottom:20px;">${gapResult.gapNodes.map(n => `<span style="display:inline-block;background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.25);font-size:12px;padding:4px 12px;border-radius:999px;margin:3px;">${n}</span>`).join("")}</div>` : ""}

    ${gapResult.strongNodes.length > 0 ? `
    <p style="margin:0 0 10px;color:#4ade80;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">✓ Strengths (${gapResult.strongNodes.length})</p>
    <div style="margin-bottom:24px;">${gapResult.strongNodes.map(n => `<span style="display:inline-block;background:rgba(34,197,94,0.1);color:#4ade80;border:1px solid rgba(34,197,94,0.25);font-size:12px;padding:4px 12px;border-radius:999px;margin:3px;">${n}</span>`).join("")}</div>` : ""}

    ${gapResult.recommendedPath.length > 0 ? `
    <p style="margin:0 0 12px;color:rgba(255,255,255,0.5);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Recommended Learning Path</p>
    ${gapResult.recommendedPath.map((step, i) => `
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:8px;">
        <tr>
          <td style="width:28px;vertical-align:middle;">
            <div style="width:24px;height:24px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);border-radius:50%;text-align:center;line-height:24px;color:#a78bfa;font-size:11px;font-weight:700;">${i + 1}</div>
          </td>
          <td style="padding-left:12px;">
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px 14px;color:rgba(255,255,255,0.75);font-size:13px;">${step}</div>
          </td>
        </tr>
      </table>`).join("")}
    <div style="height:20px;"></div>` : ""}

    ${primaryButton(`${process.env.NEXTAUTH_URL}/learn/${course._id}/quiz/diagnostic`, "View Full Analysis")}
  `, `Your knowledge gap report for ${course.title}`);

  return resend.emails.send({
    from: FROM,
    to: user.email,
    subject: `Your Knowledge Gap Report for "${course.title}"`,
    html,
  });
}

// ─── 4. Course Completion ──────────────────────────────────────────────────────

export async function sendCourseCompletion(
  user: { name?: string | null; email?: string | null },
  course: { title: string; slug: string; thumbnail?: string }
) {
  if (!user.email) return;

  const html = emailShell(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:64px;margin-bottom:16px;">🎉</div>
      ${heading(`Congratulations, ${user.name?.split(" ")[0] ?? "Learner"}!`)}
      ${body(`You've successfully completed <strong style="color:#fff;">${course.title}</strong>. That's a massive achievement — you've filled your knowledge gaps and levelled up your skills.`)}
    </div>
    ${course.thumbnail ? `<img src="${course.thumbnail}" alt="${course.title}" style="width:100%;border-radius:12px;margin-bottom:24px;display:block;" />` : ""}
    ${divider()}
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px;">
      ${[
        { icon: "📜", label: "Certificate", desc: "Your completion certificate is ready to download." },
        { icon: "🚀", label: "What's Next?", desc: "Browse more courses to continue your AI-powered learning journey." },
      ].map(f => `
        <tr>
          <td style="padding:10px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:44px;vertical-align:top;">
                  <div style="width:40px;height:40px;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">${f.icon}</div>
                </td>
                <td style="padding-left:14px;vertical-align:top;">
                  <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">${f.label}</p>
                  <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">${f.desc}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `).join("")}
    </table>
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr>
        <td style="padding-right:8px;">
          ${primaryButton(`${process.env.NEXTAUTH_URL}/dashboard`, "View Certificate")}
        </td>
        <td style="padding-left:8px;">
          <a href="${process.env.NEXTAUTH_URL}/courses" style="display:inline-block;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.8);font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,0.1);">Browse More →</a>
        </td>
      </tr>
    </table>
  `, `You completed ${course.title}!`);

  return resend.emails.send({
    from: FROM,
    to: user.email,
    subject: `🎉 Congratulations! You completed "${course.title}"`,
    html,
  });
}
