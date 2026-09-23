import { getDb } from "@/db";
import { benchLocations } from "@/db/schema";
import { ensureBenchLocations } from "@/lib/bench-locations";

export async function GET() {
  try {
    await ensureBenchLocations();
    const locations = await getDb()
      .select({
        benchId: benchLocations.benchId,
        mapX: benchLocations.mapX,
        mapY: benchLocations.mapY,
      })
      .from(benchLocations);
    return Response.json({ locations });
  } catch (error) {
    console.error("Failed to load bench locations", error);
    return Response.json(
      { error: "Bench positions are temporarily unavailable." },
      { status: 500 },
    );
  }
}
