type AdoptionEmailRecord = {
  benchId: number;
  donorName: string;
  donorEmail: string;
  dedication: string;
  termYears: number;
  termMonths: number;
  adoptedUntil: string;
  confirmationCode: string | null;
};

const siteUrl = "https://vancortlandpark.org";

function escapeHtml(value: string | number) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character,
  );
}

function duration(record: AdoptionEmailRecord) {
  const parts = [];
  if (record.termYears)
    parts.push(`${record.termYears} year${record.termYears === 1 ? "" : "s"}`);
  if (record.termMonths)
    parts.push(
      `${record.termMonths} month${record.termMonths === 1 ? "" : "s"}`,
    );
  return parts.join(" and ");
}

function frame(title: string, content: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f1e9;font-family:Arial,sans-serif;color:#17362d"><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#174f3d;color:#fff;border-radius:16px 16px 0 0;padding:24px 28px"><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.75">Van Cortlandt Park</div><h1 style="font-size:25px;margin:8px 0 0">${title}</h1></div><div style="background:#fffdf8;border:1px solid #d8d6cb;border-top:0;border-radius:0 0 16px 16px;padding:28px;line-height:1.65">${content}<p style="margin:28px 0 0;color:#68756f;font-size:13px">Van Cortlandt Park Bench Adoption<br><a href="${siteUrl}" style="color:#315f50">${siteUrl.replace("https://", "")}</a></p></div></div></body></html>`;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.EMAIL_FROM ||
        "Van Cortlandt Park Bench Adoption <benches@vancortlandpark.org>",
      to: [to],
      reply_to:
        replyTo ||
        process.env.EMAIL_REPLY_TO ||
        "vancortlandparkproject@gmail.com",
      subject,
      html,
    }),
  });
  if (!response.ok) throw new Error(`Resend returned ${response.status}`);
}

async function safely(task: Promise<void>, label: string) {
  try {
    await task;
    return true;
  } catch (error) {
    console.error(`Email failed: ${label}`, error);
    return false;
  }
}

export async function sendNewAdoptionEmails(record: AdoptionEmailRecord) {
  const code = escapeHtml(record.confirmationCode || "Pending");
  const bench = `VCP-${String(record.benchId).padStart(3, "0")}`;
  const applicant = sendEmail(
    record.donorEmail,
    `We received your bench request — ${bench}`,
    frame(
      "Your request is confirmed",
      `<p>Dear ${escapeHtml(record.donorName)},</p><p>We received your request for bench <strong>${bench}</strong>. Park staff will review it and contact you with next steps.</p><div style="background:#edf1ea;border-radius:12px;padding:18px;margin:22px 0"><strong>Confirmation code</strong><div style="font-size:24px;font-weight:700;margin-top:4px">${code}</div><p style="margin:10px 0 0">Requested term: ${escapeHtml(duration(record))}</p>${record.dedication ? `<p style="margin:8px 0 0">Plaque text: “${escapeHtml(record.dedication)}”</p>` : ""}</div><p><a href="${siteUrl}/confirmation/${encodeURIComponent(record.confirmationCode || "")}" style="display:inline-block;background:#174f3d;color:white;text-decoration:none;padding:12px 18px;border-radius:9px;font-weight:700">View request status</a></p><p>No payment has been collected. Staff approval is required before the adoption is finalized.</p>`,
    ),
  );
  const staffAddress =
    process.env.STAFF_NOTIFICATION_EMAIL || "vancortlandparkproject@gmail.com";
  const staff = sendEmail(
    staffAddress,
    `New bench request: ${bench}`,
    frame(
      "New adoption request",
      `<p><strong>${escapeHtml(record.donorName)}</strong> submitted a request for <strong>${bench}</strong>.</p><ul><li>Email: ${escapeHtml(record.donorEmail)}</li><li>Term: ${escapeHtml(duration(record))}</li><li>Confirmation: ${code}</li></ul>${record.dedication ? `<p><strong>Requested plaque text</strong><br>“${escapeHtml(record.dedication)}”</p>` : ""}<p><a href="${siteUrl}/staff" style="display:inline-block;background:#174f3d;color:white;text-decoration:none;padding:12px 18px;border-radius:9px;font-weight:700">Open staff desk</a></p>`,
    ),
  );
  const [applicantSent, staffSent] = await Promise.all([
    safely(applicant, "applicant confirmation"),
    safely(staff, "staff notification"),
  ]);
  return { applicantSent, staffSent };
}

export async function sendRenewalRequestEmails(record: AdoptionEmailRecord) {
  const bench = `VCP-${String(record.benchId).padStart(3, "0")}`;
  const staffAddress =
    process.env.STAFF_NOTIFICATION_EMAIL || "vancortlandparkproject@gmail.com";
  await Promise.all([
    safely(
      sendEmail(
        record.donorEmail,
        `Renewal request received — ${bench}`,
        frame(
          "Renewal request received",
          `<p>Dear ${escapeHtml(record.donorName)},</p><p>We received your renewal request for <strong>${bench}</strong>. Park staff will review it and contact you when it has been processed.</p>`,
        ),
      ),
      "renewal confirmation",
    ),
    safely(
      sendEmail(
        staffAddress,
        `Renewal requested: ${bench}`,
        frame(
          "Renewal requested",
          `<p><strong>${escapeHtml(record.donorName)}</strong> requested a renewal for <strong>${bench}</strong>.</p><p><a href="${siteUrl}/staff" style="display:inline-block;background:#174f3d;color:white;text-decoration:none;padding:12px 18px;border-radius:9px;font-weight:700">Review renewal</a></p>`,
        ),
      ),
      "staff renewal notification",
    ),
  ]);
}

export async function sendStatusEmail(
  record: AdoptionEmailRecord,
  action: "approve" | "reject" | "renew",
  adoptedUntil?: string,
) {
  const bench = `VCP-${String(record.benchId).padStart(3, "0")}`;
  const details =
    action === "approve"
      ? {
          subject: `Bench request approved — ${bench}`,
          title: "Your bench request was approved",
          body: `<p>Your adoption request for <strong>${bench}</strong> has been approved.</p><p>Your current term runs through <strong>${escapeHtml(adoptedUntil || record.adoptedUntil)}</strong>.</p>`,
        }
      : action === "reject"
        ? {
            subject: `Update on your bench request — ${bench}`,
            title: "Update on your request",
            body: `<p>Your request for <strong>${bench}</strong> was not approved. Reply to this email if you would like to discuss another available bench with park staff.</p>`,
          }
        : {
            subject: `Bench renewal approved — ${bench}`,
            title: "Your renewal was approved",
            body: `<p>Your adoption of <strong>${bench}</strong> has been renewed through <strong>${escapeHtml(adoptedUntil || record.adoptedUntil)}</strong>.</p>`,
          };
  return safely(
    sendEmail(
      record.donorEmail,
      details.subject,
      frame(
        details.title,
        `<p>Dear ${escapeHtml(record.donorName)},</p>${details.body}<p><a href="${siteUrl}/confirmation/${encodeURIComponent(record.confirmationCode || "")}" style="color:#315f50;font-weight:700">View adoption details</a></p>`,
      ),
    ),
    `${action} status`,
  );
}

export async function sendWaitlistEmails(record: {
  benchId: number;
  name: string;
  email: string;
  position: number;
  adoptedUntil?: string | null;
}) {
  const bench = `VCP-${String(record.benchId).padStart(3, "0")}`;
  const availability = record.adoptedUntil
    ? `<p>The current adoption is scheduled through <strong>${escapeHtml(record.adoptedUntil)}</strong>. This date may change if it is renewed.</p>`
    : "";
  const staffAddress =
    process.env.STAFF_NOTIFICATION_EMAIL || "vancortlandparkproject@gmail.com";
  const [applicantSent, staffSent] = await Promise.all([
    safely(
      sendEmail(
        record.email,
        `You joined the waitlist — ${bench}`,
        frame(
          "You're on the bench waitlist",
          `<p>Dear ${escapeHtml(record.name)},</p><p>We added you to the waitlist for <strong>${bench}</strong>. Your current position is <strong>#${record.position}</strong>.</p>${availability}<p>Joining the waitlist does not guarantee the bench. Park staff will contact people in order if the bench becomes available.</p>`,
        ),
      ),
      "waitlist confirmation",
    ),
    safely(
      sendEmail(
        staffAddress,
        `New waitlist request: ${bench}`,
        frame(
          "New waitlist request",
          `<p><strong>${escapeHtml(record.name)}</strong> joined the waitlist for <strong>${bench}</strong> at position <strong>#${record.position}</strong>.</p><p>Email: ${escapeHtml(record.email)}</p><p><a href="${siteUrl}/staff" style="display:inline-block;background:#174f3d;color:white;text-decoration:none;padding:12px 18px;border-radius:9px;font-weight:700">Open staff desk</a></p>`,
        ),
      ),
      "staff waitlist notification",
    ),
  ]);
  return { applicantSent, staffSent };
}

export async function sendContactEmails(record: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  const staffAddress =
    process.env.STAFF_NOTIFICATION_EMAIL || "vancortlandparkproject@gmail.com";
  const [staffSent, visitorSent] = await Promise.all([
    safely(
      sendEmail(
        staffAddress,
        `Website contact: ${record.topic}`,
        frame(
          "New website message",
          `<p><strong>From:</strong> ${escapeHtml(record.name)}<br><strong>Email:</strong> ${escapeHtml(record.email)}<br><strong>Topic:</strong> ${escapeHtml(record.topic)}</p><div style="white-space:pre-wrap;background:#edf1ea;border-radius:12px;padding:18px;margin-top:20px">${escapeHtml(record.message)}</div><p>Reply directly to this email to respond to ${escapeHtml(record.name)}.</p>`,
        ),
        record.email,
      ),
      "website contact message",
    ),
    safely(
      sendEmail(
        record.email,
        "We received your message — Van Cortlandt Park",
        frame(
          "Your message was received",
          `<p>Dear ${escapeHtml(record.name)},</p><p>Thank you for contacting the Van Cortlandt Park bench adoption project. We received your message about <strong>${escapeHtml(record.topic)}</strong>.</p><div style="white-space:pre-wrap;background:#edf1ea;border-radius:12px;padding:18px;margin:20px 0">${escapeHtml(record.message)}</div><p>The project team will review your message and respond to this email address.</p>`,
        ),
      ),
      "website contact confirmation",
    ),
  ]);
  return { staffSent, visitorSent };
}
