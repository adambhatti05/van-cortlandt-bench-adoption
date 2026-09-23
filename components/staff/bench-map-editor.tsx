"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, MapPin, Save, Search } from "lucide-react";
import { benches } from "@/lib/benches";
import { ParkMapImage } from "@/components/bench/park-map-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Point = { mapX: number; mapY: number };

async function readJson<T>(response: Response): Promise<Partial<T>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as T;
  } catch {
    return {};
  }
}

export function BenchMapEditor() {
  const [locations, setLocations] = useState<Record<number, Point>>({});
  const [saved, setSaved] = useState<Record<number, Point>>({});
  const [selected, setSelected] = useState(1);
  const [query, setQuery] = useState("VCP-001");
  const [dragging, setDragging] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  async function load() {
    const response = await fetch("/api/admin/bench-locations", {
      cache: "no-store",
    });
    const data = await readJson<{
      locations?: Array<{ benchId: number } & Point>;
      error?: string;
    }>(response);
    if (!response.ok || !data.locations)
      throw new Error(data.error || "Unable to load bench positions.");
    const next = Object.fromEntries(
      data.locations.map(({ benchId, mapX, mapY }) => [
        benchId,
        { mapX, mapY },
      ]),
    );
    setLocations(next);
    setSaved(next);
  }

  useEffect(() => {
    // Load saved marker positions after the editor mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((error) => setMessage(error.message));
  }, []);
  const dirty = useMemo(
    () =>
      Object.keys(locations)
        .filter((key) => {
          const id = Number(key);
          return (
            locations[id]?.mapX !== saved[id]?.mapX ||
            locations[id]?.mapY !== saved[id]?.mapY
          );
        })
        .map(Number),
    [locations, saved],
  );
  const bench = benches[selected - 1];

  function move(pointerX: number, pointerY: number) {
    if (!dragging || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const mapX = Math.max(
      3,
      Math.min(97, ((pointerX - rect.left) / rect.width) * 100),
    );
    const mapY = Math.max(
      3,
      Math.min(97, ((pointerY - rect.top) / rect.height) * 100),
    );
    setLocations((current) => ({
      ...current,
      [dragging]: {
        mapX: Number(mapX.toFixed(2)),
        mapY: Number(mapY.toFixed(2)),
      },
    }));
  }

  function findBench() {
    const match = query.match(/(\d{1,3})/);
    const id = match ? Number(match[1]) : 0;
    if (id < 1 || id > 500) {
      setMessage("Enter a bench number from 1 to 500.");
      return;
    }
    setSelected(id);
    setQuery(`VCP-${String(id).padStart(3, "0")}`);
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/bench-locations", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locations: dirty.map((benchId) => ({
            benchId,
            ...locations[benchId],
          })),
        }),
      });
      const data = await readJson<{ error?: string }>(response);
      if (!response.ok)
        throw new Error(
          data.error || "Unable to save bench positions. Please try again.",
        );
      setSaved(locations);
      setMessage(
        `${dirty.length} bench position${dirty.length === 1 ? "" : "s"} saved.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save bench positions. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border-b border-[#cfd3cb] bg-[#eef1e9] px-5 py-8 text-[#17362d]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#67756e]">
              Park inventory
            </p>
            <h1 className="mt-1 text-3xl font-semibold">
              Bench location editor
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d6c65]">
              Drag any marker to its correct location, then save. These are
              operational estimates, not surveyed GIS coordinates.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!dirty.length || saving}
              onClick={() => {
                setLocations(saved);
                setMessage("Unsaved moves reset.");
              }}
            >
              Reset unsaved
            </Button>
            <Button disabled={!dirty.length || saving} onClick={save}>
              <Save />
              {saving
                ? "Saving…"
                : `Save ${dirty.length || ""} change${dirty.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border bg-[#fffdf8] p-4 shadow-sm">
            <label className="text-sm font-semibold" htmlFor="bench-search">
              Find a bench
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id="bench-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") findBench();
                }}
                placeholder="VCP-001"
              />
              <Button size="icon" onClick={findBench} aria-label="Find bench">
                <Search />
              </Button>
            </div>
            <div className="mt-5 rounded-xl bg-[#edf1ea] p-4">
              <p className="font-mono text-sm font-bold">{bench?.code}</p>
              <p className="mt-2 font-semibold">{bench?.area}</p>
              <p className="mt-1 flex gap-1 text-sm text-[#627069]">
                <MapPin size={16} />
                Near {bench?.landmark}
              </p>
              {locations[selected] && (
                <p className="mt-3 text-xs text-[#758079]">
                  Map position: {locations[selected].mapX.toFixed(1)}%,{" "}
                  {locations[selected].mapY.toFixed(1)}%
                </p>
              )}
            </div>
            <p className="mt-4 flex gap-2 text-xs leading-5 text-[#65736c]">
              <LocateFixed className="mt-0.5 shrink-0" size={15} />
              All 500 markers are shown. Click a dot to select it, then drag it.
              Save when finished.
            </p>
            {message && (
              <p
                role="status"
                className="mt-4 rounded-lg bg-white p-3 text-sm font-semibold"
              >
                {message}
              </p>
            )}
          </aside>
          <div
            ref={mapRef}
            onPointerMove={(event) => move(event.clientX, event.clientY)}
            onPointerUp={() => setDragging(null)}
            onPointerCancel={() => setDragging(null)}
            className="relative mx-auto aspect-[612/792] w-full max-w-4xl overflow-hidden rounded-2xl border bg-[#dce6d8] shadow-sm"
            style={{ touchAction: "none" }}
          >
            <ParkMapImage />
            {benches.map((item) => {
              const point = locations[item.id] || {
                mapX: item.mapX,
                mapY: item.mapY,
              };
              const active = selected === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={`${item.code} · ${item.area}`}
                  aria-label={`Move ${item.code}`}
                  onClick={() => {
                    setSelected(item.id);
                    setQuery(item.code);
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setSelected(item.id);
                    setQuery(item.code);
                    setDragging(item.id);
                  }}
                  style={{ left: `${point.mapX}%`, top: `${point.mapY}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm transition-[width,height,background-color] ${active ? "z-20 h-5 w-5 bg-[#c84d37] ring-4 ring-white/70" : "z-10 h-2.5 w-2.5 bg-[#245f49] hover:h-4 hover:w-4"}`}
                />
              );
            })}
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold shadow">
              Official park map · 500 editable markers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
