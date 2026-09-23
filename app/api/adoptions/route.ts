import { and, eq, inArray, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { adoptions } from "@/db/schema";
import { sendNewAdoptionEmails } from "@/lib/email";
import { addSampleInventory } from "@/lib/sample-inventory";

const publicFields = {
  benchId: adoptions.benchId,
  donorName: adoptions.donorName,
  dedication: adoptions.dedication,
  termYears: adoptions.termYears,
  termMonths: adoptions.termMonths,
  status: adoptions.status,
  adoptedUntil: adoptions.adoptedUntil,
};

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function makeConfirmationCode() {
  return `VCP-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

async function expireOldAdoptions() {
  const today = new Date().toISOString().slice(0, 10);
  await getDb()
    .update(adoptions)
    .set({ status: "expired", updatedAt: new Date().toISOString() })
    .where(
      and(eq(adoptions.status, "approved"), lt(adoptions.adoptedUntil, today)),
    );
}

export async function GET() {
  try {
    const db = getDb();
    const liveAdoptions = await db
      .select(publicFields)
      .from(adoptions)
      .where(inArray(adoptions.status, ["pending", "approved"]));
    return Response.json({ adoptions: addSampleInventory(liveAdoptions) });
  } catch (error) {
    console.error("Failed to load adoptions", error);
    return Response.json(
      { error: "Bench availability is temporarily unavailable." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const benchId = Number(body.benchId);
    const donorName = clean(body.donorName, 80);
    const donorEmail = clean(body.donorEmail, 120).toLowerCase();
    const dedication = clean(body.dedication, 180);
    const termYears = Number(body.termYears);
    const termMonths = Number(body.termMonths ?? 0);
    const honeypot = clean(body.company, 100);
    const startedAt = Number(body.startedAt);

    if (honeypot)
      return Response.json(
        { error: "Unable to submit this request." },
        { status: 400 },
      );
    if (
      !Number.isFinite(startedAt) ||
      Date.now() - startedAt < 1800 ||
      Date.now() - startedAt > 3_600_000
    ) {
      return Response.json(
        { error: "Please reopen the form and try again." },
        { status: 400 },
      );
    }
    if (!Number.isInteger(benchId) || benchId < 1 || benchId > 500)
      return Response.json({ error: "Select a valid bench." }, { status: 400 });
    if (donorName.length < 2)
      return Response.json({ error: "Enter the donor name." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(donorEmail))
      return Response.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    if (!Number.isInteger(termYears) || termYears < 0 || termYears > 50)
      return Response.json(
        { error: "Select between 0 and 50 years." },
        { status: 400 },
      );
    if (!Number.isInteger(termMonths) || termMonths < 0 || termMonths > 11)
      return Response.json(
        { error: "Select between 0 and 11 additional months." },
        { status: 400 },
      );
    if (termYears === 50 && termMonths > 0)
      return Response.json(
        { error: "The adoption term cannot exceed 50 years." },
        { status: 400 },
      );
    if (termYears === 0 && termMonths === 0)
      return Response.json(
        { error: "The adoption term must be at least one month." },
        { status: 400 },
      );

    const db = getDb();
    await expireOldAdoptions();
    const recentForEmail = await db
      .select({ adoptedAt: adoptions.adoptedAt })
      .from(adoptions)
      .where(eq(adoptions.donorEmail, donorEmail));
    const cutoff = Date.now() - 86_400_000;
    if (
      recentForEmail.filter((row) => new Date(row.adoptedAt).getTime() > cutoff)
        .length >= 3
    ) {
      return Response.json(
        { error: "Too many requests were submitted for this email today." },
        { status: 429 },
      );
    }

    const [existing] = await db
      .select()
      .from(adoptions)
      .where(eq(adoptions.benchId, benchId))
      .limit(1);
    if (existing && ["pending", "approved"].includes(existing.status)) {
      return Response.json(
        { error: "This bench is already reserved or adopted." },
        { status: 409 },
      );
    }

    const confirmationCode = makeConfirmationCode();
    const until = new Date();
    until.setFullYear(until.getFullYear() + termYears);
    until.setMonth(until.getMonth() + termMonths);
    const values = {
      donorName,
      donorEmail,
      dedication,
      termYears,
      termMonths,
      status: "pending",
      confirmationCode,
      renewalRequested: false,
      adoptedUntil: until.toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
    };

    const [created] = existing
      ? await db
          .update(adoptions)
          .set(values)
          .where(eq(adoptions.id, existing.id))
          .returning(publicFields)
      : await db
          .insert(adoptions)
          .values({ benchId, ...values })
          .returning(publicFields);

    const email = await sendNewAdoptionEmails({
      benchId,
      donorName,
      donorEmail,
      dedication,
      termYears,
      termMonths,
      adoptedUntil: values.adoptedUntil,
      confirmationCode,
    });
    return Response.json(
      { adoption: created, confirmationCode, emailSent: email.applicantSent },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create adoption", error);
    return Response.json(
      { error: "We couldn't save this request. Please try again." },
      { status: 500 },
    );
  }
}
