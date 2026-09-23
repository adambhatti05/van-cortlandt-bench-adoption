import { and, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adoptions, waitlistEntries } from "@/db/schema";
import { sendWaitlistEmails } from "@/lib/email";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const benchId = Number(body.benchId);
    const name = clean(body.name, 80);
    const email = clean(body.email, 120).toLowerCase();
    const honeypot = clean(body.company, 100);
    const startedAt = Number(body.startedAt);
    if (honeypot)
      return Response.json(
        { error: "Unable to join the waitlist." },
        { status: 400 },
      );
    if (
      !Number.isFinite(startedAt) ||
      Date.now() - startedAt < 1200 ||
      Date.now() - startedAt > 3_600_000
    )
      return Response.json(
        { error: "Please reopen the form and try again." },
        { status: 400 },
      );
    if (!Number.isInteger(benchId) || benchId < 1 || benchId > 500)
      return Response.json({ error: "Select a valid bench." }, { status: 400 });
    if (name.length < 2)
      return Response.json({ error: "Enter your name." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return Response.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );

    const db = getDb();
    const [adoption] = await db
      .select({
        status: adoptions.status,
        adoptedUntil: adoptions.adoptedUntil,
      })
      .from(adoptions)
      .where(eq(adoptions.benchId, benchId))
      .limit(1);
    if (!adoption || !["pending", "approved"].includes(adoption.status))
      return Response.json(
        {
          error:
            "This bench is currently available and does not need a waitlist.",
        },
        { status: 409 },
      );
    const [duplicate] = await db
      .select({ id: waitlistEntries.id })
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.benchId, benchId),
          eq(waitlistEntries.email, email),
        ),
      )
      .limit(1);
    if (duplicate)
      return Response.json(
        { error: "This email is already on the waitlist for this bench." },
        { status: 409 },
      );

    await db.insert(waitlistEntries).values({ benchId, name, email });
    const [positionRow] = await db
      .select({ value: count() })
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.benchId, benchId),
          eq(waitlistEntries.status, "waiting"),
        ),
      );
    const position = positionRow?.value || 1;
    const mail = await sendWaitlistEmails({
      benchId,
      name,
      email,
      position,
      adoptedUntil: adoption.adoptedUntil,
    });
    return Response.json(
      { ok: true, position, emailSent: mail.applicantSent },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to join waitlist", error);
    return Response.json(
      { error: "We couldn't save your waitlist request. Please try again." },
      { status: 500 },
    );
  }
}
