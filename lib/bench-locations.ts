import { getD1, getDb } from "@/db";
import { benchLocations } from "@/db/schema";
import { benches } from "@/lib/benches";

export async function ensureBenchLocations() {
  const db = getDb();
  const existing = await db.select().from(benchLocations);
  if (existing.length) {
    const defaults = new Map(benches.map((bench) => [bench.id, bench]));
    const updates = existing
      .filter((item) => item.layoutVersion < 2)
      .flatMap((row) => {
        const fallback = defaults.get(row.benchId);
        if (!fallback) return [];
        // Preserve positions a staff member explicitly saved; reset only the old generated layout.
        const staffPositioned = row.updatedAt.includes("T");
        return [
          staffPositioned
            ? getD1()
                .prepare(
                  "UPDATE bench_locations SET layout_version = 2 WHERE bench_id = ?",
                )
                .bind(row.benchId)
            : getD1()
                .prepare(
                  "UPDATE bench_locations SET map_x = ?, map_y = ?, layout_version = 2 WHERE bench_id = ?",
                )
                .bind(fallback.mapX, fallback.mapY, row.benchId),
        ];
      });
    for (let offset = 0; offset < updates.length; offset += 75) {
      await getD1().batch(updates.slice(offset, offset + 75));
    }
    return;
  }
  // Keep each statement below D1's bound-parameter limit (three values per bench).
  for (let offset = 0; offset < benches.length; offset += 25) {
    await db
      .insert(benchLocations)
      .values(
        benches.slice(offset, offset + 25).map((bench) => ({
          benchId: bench.id,
          mapX: bench.mapX,
          mapY: bench.mapY,
          layoutVersion: 2,
        })),
      )
      .onConflictDoNothing();
  }
}
