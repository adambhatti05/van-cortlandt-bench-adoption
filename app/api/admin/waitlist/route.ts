import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adoptions, waitlistEntries } from "@/db/schema";
import { requireAdminApi } from "@/lib/staff-auth";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    const entries = await getDb()
      .select({
        id: waitlistEntries.id,
        benchId: waitlistEntries.benchId,
        name: waitlistEntries.name,
        email: waitlistEntries.email,
        status: waitlistEntries.status,
        createdAt: waitlistEntries.createdAt,
        adoptedUntil: adoptions.adoptedUntil,
      })
      .from(waitlistEntries)
      .leftJoin(adoptions, eq(waitlistEntries.benchId, adoptions.benchId))
      .orderBy(asc(waitlistEntries.benchId), asc(waitlistEntries.createdAt));
    return Response.json({ entries });
  } catch (error) {
    console.error("Failed to load waitlist", error);
    return Response.json(
      { error: "Unable to load the waitlist." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    const body = (await request.json()) as { id?: unknown; action?: unknown };
    const id = Number(body.id);
    const action = typeof body.action === "string" ? body.action : "";
    if (
      !Number.isInteger(id) ||
      !["contacted", "waiting", "remove"].includes(action)
    )
      return Response.json(
        { error: "Invalid waitlist action." },
        { status: 400 },
      );
    const db = getDb();
    if (action === "remove")
      await db.delete(waitlistEntries).where(eq(waitlistEntries.id, id));
    else
      await db
        .update(waitlistEntries)
        .set({ status: action, updatedAt: new Date().toISOString() })
        .where(eq(waitlistEntries.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Waitlist update failed", error);
    return Response.json(
      { error: "The waitlist could not be updated." },
      { status: 500 },
    );
  }
}
