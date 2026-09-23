import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { benchLocations } from "@/db/schema";
import { ensureBenchLocations } from "@/lib/bench-locations";
import { requireAdminApi } from "@/lib/staff-auth";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    await ensureBenchLocations();
    return Response.json({
      locations: await getDb().select().from(benchLocations),
    });
  } catch (error) {
    console.error("Unable to load bench locations", error);
    return Response.json(
      { error: "Bench positions could not be loaded. Please try again." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      locations?: Array<{ benchId?: unknown; mapX?: unknown; mapY?: unknown }>;
    };
    if (!Array.isArray(body.locations) || body.locations.length > 500)
      return Response.json(
        { error: "Invalid location update." },
        { status: 400 },
      );
    const locations = body.locations.map((item) => ({
      benchId: Number(item.benchId),
      mapX: Number(item.mapX),
      mapY: Number(item.mapY),
    }));
    if (
      locations.some(
        (item) =>
          !Number.isInteger(item.benchId) ||
          item.benchId < 1 ||
          item.benchId > 500 ||
          !Number.isFinite(item.mapX) ||
          !Number.isFinite(item.mapY) ||
          item.mapX < 3 ||
          item.mapX > 97 ||
          item.mapY < 3 ||
          item.mapY > 97,
      )
    )
      return Response.json(
        { error: "A marker is outside the editable map." },
        { status: 400 },
      );
    await ensureBenchLocations();
    const db = getDb();
    const now = new Date().toISOString();
    for (const item of locations)
      await db
        .update(benchLocations)
        .set({
          mapX: item.mapX,
          mapY: item.mapY,
          layoutVersion: 2,
          updatedAt: now,
        })
        .where(eq(benchLocations.benchId, item.benchId));
    return Response.json({ ok: true, updated: locations.length });
  } catch (error) {
    console.error("Unable to save bench locations", error);
    return Response.json(
      { error: "Bench positions could not be saved. Please try again." },
      { status: 500 },
    );
  }
}
