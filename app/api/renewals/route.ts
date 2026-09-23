import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adoptions } from "@/db/schema";
import { sendRenewalRequestEmails } from "@/lib/email";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const confirmationCode = clean(body.confirmationCode, 32).toUpperCase();
    const donorEmail = clean(body.donorEmail, 120).toLowerCase();
    const company = clean(body.company, 100);
    if (company)
      return Response.json(
        { error: "Unable to submit this request." },
        { status: 400 },
      );
    if (!confirmationCode || !/^\S+@\S+\.\S+$/.test(donorEmail)) {
      return Response.json(
        { error: "Enter your confirmation code and email." },
        { status: 400 },
      );
    }

    const db = getDb();
    const [record] = await db
      .select()
      .from(adoptions)
      .where(
        and(
          eq(adoptions.confirmationCode, confirmationCode),
          eq(adoptions.donorEmail, donorEmail),
        ),
      )
      .limit(1);

    if (!record)
      return Response.json(
        { error: "We couldn't match that confirmation code and email." },
        { status: 404 },
      );
    if (record.renewalRequested)
      return Response.json({ ok: true, alreadyRequested: true });

    await db
      .update(adoptions)
      .set({ renewalRequested: true, updatedAt: new Date().toISOString() })
      .where(eq(adoptions.id, record.id));

    await sendRenewalRequestEmails(record);

    return Response.json({ ok: true, alreadyRequested: false });
  } catch (error) {
    console.error("Failed to request renewal", error);
    return Response.json(
      { error: "We couldn't save the renewal request." },
      { status: 500 },
    );
  }
}
