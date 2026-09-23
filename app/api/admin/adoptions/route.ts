import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adoptions } from "@/db/schema";
import { requireAdminApi } from "@/lib/staff-auth";
import { sendStatusEmail } from "@/lib/email";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const rows = await getDb()
    .select()
    .from(adoptions)
    .orderBy(adoptions.adoptedAt);
  return Response.json({ adoptions: rows });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    const body = (await request.json()) as {
      id?: unknown;
      action?: unknown;
      dedication?: unknown;
    };
    const id = Number(body.id);
    const action = typeof body.action === "string" ? body.action : "";
    if (
      !Number.isInteger(id) ||
      !["approve", "reject", "renew", "update"].includes(action)
    ) {
      return Response.json({ error: "Invalid staff action." }, { status: 400 });
    }

    const db = getDb();
    const [record] = await db
      .select()
      .from(adoptions)
      .where(eq(adoptions.id, id))
      .limit(1);
    if (!record)
      return Response.json({ error: "Adoption not found." }, { status: 404 });

    let updatedUntil = record.adoptedUntil;
    if (action === "update") {
      const dedication =
        typeof body.dedication === "string"
          ? body.dedication.trim().slice(0, 180)
          : "";
      await db
        .update(adoptions)
        .set({ dedication, updatedAt: new Date().toISOString() })
        .where(eq(adoptions.id, id));
    } else if (action === "approve") {
      await db
        .update(adoptions)
        .set({ status: "approved", updatedAt: new Date().toISOString() })
        .where(eq(adoptions.id, id));
    } else if (action === "reject") {
      await db
        .update(adoptions)
        .set({ status: "rejected", updatedAt: new Date().toISOString() })
        .where(eq(adoptions.id, id));
    } else {
      const until = new Date(
        Math.max(
          Date.now(),
          new Date(record.adoptedUntil + "T00:00:00").getTime(),
        ),
      );
      until.setFullYear(until.getFullYear() + Math.max(0, record.termYears));
      until.setMonth(until.getMonth() + Math.max(0, record.termMonths));
      updatedUntil = until.toISOString().slice(0, 10);
      await db
        .update(adoptions)
        .set({
          status: "approved",
          renewalRequested: false,
          adoptedUntil: updatedUntil,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(adoptions.id, id));
    }

    if (action === "approve" || action === "reject" || action === "renew")
      await sendStatusEmail(record, action, updatedUntil);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Staff update failed", error);
    return Response.json(
      { error: "The adoption could not be updated." },
      { status: 500 },
    );
  }
}
