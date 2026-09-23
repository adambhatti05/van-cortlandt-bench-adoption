import { sendContactEmails } from "@/lib/email";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const topics = [
  "Bench adoption",
  "Existing adoption",
  "Bench location",
  "Website feedback",
  "Other",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = clean(body.name, 80);
    const email = clean(body.email, 120).toLowerCase();
    const topic = clean(body.topic, 60);
    const message = clean(body.message, 2000);
    const honeypot = clean(body.company, 100);
    const startedAt = Number(body.startedAt);
    if (honeypot)
      return Response.json(
        { error: "Unable to send this message." },
        { status: 400 },
      );
    if (
      !Number.isFinite(startedAt) ||
      Date.now() - startedAt < 1500 ||
      Date.now() - startedAt > 3_600_000
    )
      return Response.json(
        { error: "Please reopen the form and try again." },
        { status: 400 },
      );
    if (name.length < 2)
      return Response.json({ error: "Enter your name." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return Response.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    if (!topics.includes(topic))
      return Response.json(
        { error: "Choose a message topic." },
        { status: 400 },
      );
    if (message.length < 10)
      return Response.json(
        { error: "Please include a little more detail in your message." },
        { status: 400 },
      );
    const sent = await sendContactEmails({ name, email, topic, message });
    if (!sent.staffSent || !sent.visitorSent)
      return Response.json(
        {
          error:
            "Your message or confirmation email could not be sent right now. Please try again.",
        },
        { status: 502 },
      );
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact form failed", error);
    return Response.json(
      { error: "Your message could not be sent right now. Please try again." },
      { status: 500 },
    );
  }
}
