"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Grid2X2,
  Leaf,
  Map,
  MapPin,
  Search,
  Trees,
  UserPlus,
  X,
} from "lucide-react";
import { benches, areaNames, type Bench } from "@/lib/benches";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdoptionRequestForm } from "@/components/bench/adoption-request-form";
import { ParkMapImage } from "@/components/bench/park-map-image";

type Adoption = {
  benchId: number;
  donorName: string;
  dedication: string;
  termYears: number;
  adoptedUntil: string;
  status: string;
  prototypeInventory?: boolean;
};
type Status = "all" | "available" | "pending" | "adopted";

export function BenchDirectory() {
  const [adoptions, setAdoptions] = useState<Record<number, Adoption>>({});
  const [locations, setLocations] = useState<
    Record<number, { mapX: number; mapY: number }>
  >({});
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All areas");
  const [status, setStatus] = useState<Status>("all");
  const [selected, setSelected] = useState<Bench | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [visible, setVisible] = useState(18);
  const [view, setView] = useState<"list" | "map">("list");

  async function loadAdoptions() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      setLoadError("");
      const response = await fetch("/api/adoptions", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as { adoptions: Adoption[] };
      setAdoptions(
        Object.fromEntries(data.adoptions.map((item) => [item.benchId, item])),
      );
    } catch {
      setLoadError(
        "Live availability could not be loaded. Try again in a moment.",
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  async function loadLocations() {
    try {
      const response = await fetch("/api/bench-locations", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        locations: Array<{ benchId: number; mapX: number; mapY: number }>;
      };
      setLocations(
        Object.fromEntries(
          data.locations.map(({ benchId, mapX, mapY }) => [
            benchId,
            { mapX, mapY },
          ]),
        ),
      );
    } catch {
      /* Fall back to the bundled schematic positions. */
    }
  }

  useEffect(() => {
    // These requests populate client state after the directory mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAdoptions();
    void loadLocations();
  }, []);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return benches.filter((bench) => {
      const current =
        adoptions[bench.id]?.status === "approved"
          ? "adopted"
          : adoptions[bench.id]?.status || "available";
      return (
        (!needle ||
          `${bench.code} ${bench.area} ${bench.landmark}`
            .toLowerCase()
            .includes(needle)) &&
        (area === "All areas" || bench.area === area) &&
        (status === "all" || status === current)
      );
    });
  }, [adoptions, area, query, status]);
  const adoptedCount = Object.values(adoptions).filter(
    (item) => item.status === "approved",
  ).length;
  const pendingCount = Object.values(adoptions).filter(
    (item) => item.status === "pending",
  ).length;
  function selectSummary(nextStatus: Status) {
    setStatus(nextStatus);
    setVisible(18);
    window.requestAnimationFrame(() =>
      document
        .getElementById("bench-directory")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#d8d6cb] bg-[#fffdf8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#174f3d] text-white">
              <Trees size={21} />
            </span>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[.16em] text-[#6b766f]">
                Van Cortlandt Park
              </p>
              <p className="text-[17px] font-semibold tracking-tight">
                Bench Adoption
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-end gap-1 text-sm font-semibold text-[#315f50]">
            <Link
              href="/contact"
              className="rounded-lg px-3 py-2 hover:bg-[#e9eee9]"
            >
              Contact us
            </Link>
            <Link
              href="/renew"
              className="rounded-lg px-3 py-2 hover:bg-[#e9eee9]"
            >
              Renew
            </Link>
            <Link
              href="/staff"
              className="rounded-lg px-3 py-2 hover:bg-[#e9eee9]"
            >
              Staff login
            </Link>
          </nav>
        </div>
      </header>

      <section className="paper-grid border-b border-[#d8d6cb]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#becbc3] bg-white/70 px-3 py-1.5 text-sm font-semibold text-[#315f50]">
              <Leaf size={15} /> More than 500 places to pause
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-[#17362d] sm:text-6xl">
              Find a bench that means something.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#56665f]">
              Honor someone, celebrate a milestone, or support the park you
              love. Explore every bench and choose the right setting for your
              dedication.
            </p>
          </div>
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#bec8c0] shadow-[0_18px_45px_rgba(25,63,49,.16)]">
              <Image
                src="/park-aerial.png"
                alt="Aerial view of Van Cortlandt Park"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-[#ccd1ca] bg-[#fffdf8] sm:grid-cols-4">
              <Stat
                value="500"
                label="benches"
                active={status === "all"}
                onClick={() => selectSummary("all")}
              />
              <Stat
                value={
                  loading || loadError
                    ? "—"
                    : String(500 - adoptedCount - pendingCount)
                }
                label="available"
                active={status === "available"}
                onClick={() => selectSummary("available")}
              />
              <Stat
                value={loading || loadError ? "—" : String(adoptedCount)}
                label="unavailable"
                active={status === "adopted"}
                onClick={() => selectSummary("adopted")}
              />
              <Stat
                value={loading || loadError ? "—" : String(pendingCount)}
                label="pending"
                active={status === "pending"}
                onClick={() => selectSummary("pending")}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="bench-directory"
        className="mx-auto max-w-7xl scroll-mt-4 px-5 py-8 sm:px-8"
      >
        <div className="sticky top-0 z-20 -mx-2 mb-7 rounded-2xl border border-[#d5d5cc] bg-[#f7f5ef]/95 p-3 shadow-[0_10px_30px_rgba(25,63,49,.07)] backdrop-blur sm:top-3">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search benches</span>
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#637068]"
                size={19}
              />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisible(18);
                }}
                placeholder="Search by bench number, area, or landmark"
                className="h-12 border-[#cfd2cb] bg-white pl-11 text-base"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setVisible(18);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#637068]"
                >
                  <X size={18} />
                </button>
              )}
            </label>
            <label className="relative block">
              <span className="sr-only">Filter by park area</span>
              <select
                value={area}
                onChange={(event) => {
                  setArea(event.target.value);
                  setVisible(18);
                }}
                className="h-12 w-full appearance-none rounded-[var(--radius-md)] border border-[#cfd2cb] bg-white px-4 pr-10 text-base outline-none focus:ring-2 focus:ring-[#2d6f57]"
              >
                <option>All areas</option>
                {areaNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#637068]"
                size={18}
              />
            </label>
            <div
              className="flex rounded-xl bg-[#e6e9e2] p-1"
              aria-label="Availability filter"
            >
              {(["all", "available", "pending", "adopted"] as Status[]).map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setStatus(item);
                      setVisible(18);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${status === item ? "bg-white text-[#17362d] shadow-sm" : "text-[#647169] hover:text-[#17362d]"}`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <div className="flex rounded-xl bg-[#e6e9e2] p-1">
              <button
                aria-label="List view"
                onClick={() => setView("list")}
                className={`rounded-lg px-3 ${view === "list" ? "bg-white shadow-sm" : ""}`}
              >
                <Grid2X2 size={18} />
              </button>
              <button
                aria-label="Map view"
                onClick={() => setView("map")}
                className={`rounded-lg px-3 ${view === "map" ? "bg-white shadow-sm" : ""}`}
              >
                <Map size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.13em] text-[#738078]">
              Bench directory
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {filtered.length} {filtered.length === 1 ? "bench" : "benches"}
            </h2>
          </div>
          <p className="text-sm text-[#65736c]">
            {view === "map"
              ? "Approximate locations on the official park map"
              : "Live request status"}
          </p>
        </div>
        {loadError && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#d7b8ad] bg-[#fff4f0] px-4 py-3 text-sm text-[#7f3025]">
            <span>{loadError}</span>
            <button
              className="font-semibold underline"
              onClick={() => {
                setLoading(true);
                void loadAdoptions();
              }}
            >
              Retry
            </button>
          </div>
        )}
        {!loadError &&
          (filtered.length ? (
            view === "map" ? (
              <BenchMap
                benches={filtered}
                adoptions={adoptions}
                locations={locations}
                onSelect={setSelected}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.slice(0, visible).map((bench) => (
                  <BenchCard
                    key={bench.id}
                    bench={bench}
                    adoption={adoptions[bench.id]}
                    onSelect={() => setSelected(bench)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-[#bdc6bf] bg-white/50 py-16 text-center">
              <Trees className="mx-auto mb-3 text-[#789084]" />
              <h3 className="text-xl font-semibold">
                No benches match those filters
              </h3>
            </div>
          ))}
        {!loadError && view === "list" && visible < filtered.length && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="h-11 bg-white px-7"
              onClick={() => setVisible((count) => count + 18)}
            >
              Show more benches
            </Button>
          </div>
        )}
      </section>

      <section className="border-t border-[#d2d6ce] bg-[#eef2eb]">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-8 md:grid-cols-[.9fr_1.1fr] md:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#bdc9c0] shadow-sm">
            <Image
              src="/van-cortlandt-lake.png"
              alt="Autumn view across Van Cortlandt Lake"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-[#65776e]">
              A place worth remembering
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              A dedication rooted in the park.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5d6d65]">
              Each bench offers a lasting place to pause, gather, and
              remember—surrounded by the landscapes that make Van Cortlandt Park
              distinctive.
            </p>
          </div>
        </div>
      </section>
      <section
        id="how-it-works"
        className="border-t border-[#cfd3cb] bg-[#183c31] text-[#f8f4e9]"
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[.15em] text-[#b9d0c5]">
            How it works
          </p>
          <div className="mt-7 grid gap-7 md:grid-cols-3">
            <Step
              number="01"
              title="Choose a bench"
              text="Search all 500 benches by location and availability."
            />
            <Step
              number="02"
              title="Write your dedication"
              text="Share the name and message you would like associated with the bench."
            />
            <Step
              number="03"
              title="Park staff follows up"
              text="Your selection is held and staff contacts you to confirm the adoption."
            />
          </div>
          <p className="mt-10 border-t border-white/15 pt-6 text-sm text-[#afc6bb]">
            Prototype for Van Cortlandt Park • No payment is collected through
            this site.
          </p>
        </div>
      </section>
      <BenchDialog
        key={selected?.id ?? "closed"}
        bench={selected}
        adoption={selected ? adoptions[selected.id] : undefined}
        location={selected ? locations[selected.id] : undefined}
        onClose={() => setSelected(null)}
        onAdopted={(adoption) =>
          setAdoptions((current) => ({
            ...current,
            [adoption.benchId]: adoption,
          }))
        }
      />
    </main>
  );
}

function Stat({
  value,
  label,
  active,
  onClick,
}: {
  value: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`border-r border-[#d9dad2] px-3 py-6 text-center transition last:border-r-0 hover:bg-[#edf1ea] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#2d6f57] ${active ? "bg-[#edf1ea]" : ""}`}
    >
      <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[.11em] text-[#768078]">
        {label}
      </p>
    </button>
  );
}
function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <span className="text-sm font-semibold text-[#90b5a4]">{number}</span>
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 leading-7 text-[#c6d6ce]">{text}</p>
      </div>
    </div>
  );
}

function BenchMap({
  benches: items,
  adoptions,
  locations,
  onSelect,
}: {
  benches: Bench[];
  adoptions: Record<number, Adoption>;
  locations: Record<number, { mapX: number; mapY: number }>;
  onSelect: (bench: Bench) => void;
}) {
  return (
    <div className="relative mx-auto aspect-[612/792] w-full max-w-4xl overflow-hidden rounded-2xl border bg-[#dce6d8]">
      <ParkMapImage />
      {items.map((bench) => {
        const point = locations[bench.id] || bench;
        return (
          <button
            key={bench.id}
            onClick={() => onSelect(bench)}
            title={bench.code}
            style={{ left: point.mapX + "%", top: point.mapY + "%" }}
            className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow transition-transform hover:z-10 hover:scale-150 ${adoptions[bench.id]?.status === "approved" ? "bg-[#80664b]" : adoptions[bench.id]?.status === "pending" ? "bg-[#d49a31]" : "bg-[#25664c]"}`}
          />
        );
      })}
      <p className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-xs shadow">
        Select a marker · Approximate locations · Staff editable
      </p>
    </div>
  );
}

function BenchCard({
  bench,
  adoption,
  onSelect,
}: {
  bench: Bench;
  adoption?: Adoption;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="bench-card group rounded-2xl border border-[#d5d4ca] bg-[#fffdf8] p-5 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-lg bg-[#e5ebe4] px-2.5 py-1 font-mono text-sm font-semibold text-[#315f50]">
          {bench.code}
        </span>
        <StatusPill
          adopted={adoption?.status === "approved"}
          status={adoption?.status}
        />
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight">
        {bench.area}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-[#68746e]">
        <MapPin size={15} /> Near {bench.landmark}
      </p>
      {adoption ? (
        <div className="mt-5 border-l-2 border-[#c6b59f] pl-3">
          <p className="line-clamp-2 text-sm italic leading-6 text-[#675d52]">
            “{adoption.dedication || `Requested by ${adoption.donorName}`}”
          </p>
          <p className="mt-1 text-xs font-semibold text-[#827364]">
            {adoption.status === "pending"
              ? "Awaiting staff review"
              : `Through ${formatDate(adoption.adoptedUntil, true)}`}
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#53665d]">
          <span className="rounded-md bg-[#eff1eb] px-2 py-1">
            {bench.accessibility}
          </span>
          <span className="rounded-md bg-[#eff1eb] px-2 py-1">
            {bench.shade}
          </span>
        </div>
      )}
      <div className="mt-5 flex items-center justify-between border-t border-[#e2e0d7] pt-4 text-sm font-semibold text-[#315f50]">
        <span>
          {adoption?.status === "pending"
            ? "View pending request"
            : adoption
              ? "View dedication"
              : "View and adopt"}
        </span>
        <span
          aria-hidden
          className="transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </button>
  );
}

function StatusPill({
  adopted,
  status,
}: {
  adopted: boolean;
  status?: string;
}) {
  const pending = status === "pending";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${pending ? "bg-[#fff0c9] text-[#765111]" : adopted ? "bg-[#ece7dd] text-[#7d6650]" : "bg-[#dcebdd] text-[#23613e]"}`}
    >
      {pending ? "Pending" : adopted ? "Adopted" : "Available"}
    </span>
  );
}
function formatDate(value: string, short = false) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-US",
    short
      ? { year: "numeric", month: "short" }
      : { year: "numeric", month: "long", day: "numeric" },
  );
}

function BenchDialog({
  bench,
  adoption,
  location,
  onClose,
  onAdopted,
}: {
  bench: Bench | null;
  adoption?: Adoption;
  location?: { mapX: number; mapY: number };
  onClose: () => void;
  onAdopted: (adoption: Adoption) => void;
}) {
  const [submitted, setSubmitted] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [confirmationCode, setConfirmationCode] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  if (!bench) return null;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/adoptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          benchId: bench!.id,
          donorName: form.get("donorName"),
          donorEmail: form.get("donorEmail"),
          dedication: form.get("dedication"),
          termYears: Number(form.get("termYears")),
          termMonths: Number(form.get("termMonths")),
          company: form.get("company"),
          startedAt: startedAt.current,
        }),
      });
      const data = (await response.json()) as {
        adoption?: Adoption;
        confirmationCode?: string;
        error?: string;
      };
      if (!response.ok || !data.adoption)
        throw new Error(data.error || "Unable to submit adoption.");
      onAdopted(data.adoption);
      setConfirmationCode(data.confirmationCode || "");
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit adoption.",
      );
    } finally {
      setSaving(false);
    }
  }
  const point = location || { mapX: bench.mapX, mapY: bench.mapY };
  return (
    <Dialog
      open={Boolean(bench)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#ccd0c8] bg-[#fffdf8] sm:max-w-xl">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-lg bg-[#e5ebe4] px-2.5 py-1 font-mono text-sm font-semibold text-[#315f50]">
              {bench.code}
            </span>
            <StatusPill
              adopted={adoption?.status === "approved"}
              status={adoption?.status}
            />
          </div>
          <DialogTitle className="text-2xl text-[#17362d]">
            {bench.area}
          </DialogTitle>
          <DialogDescription className="text-base text-[#627069]">
            Near {bench.landmark} · {bench.accessibility} · {bench.shade}
          </DialogDescription>
        </DialogHeader>
        <div className="border-y border-[#e2e0d7] py-2">
          <button
            type="button"
            onClick={() => setShowLocation((shown) => !shown)}
            aria-expanded={showLocation}
            className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm font-semibold text-[#315f50] hover:text-[#17362d]"
          >
            <span className="flex items-center gap-2">
              <MapPin size={16} />
              {showLocation
                ? "Hide approximate location"
                : "View approximate location"}
            </span>
            <ChevronDown
              size={17}
              className={`transition-transform ${showLocation ? "rotate-180" : ""}`}
            />
          </button>
          {showLocation && (
            <div className="mt-2">
              <div className="relative mx-auto aspect-[612/792] w-full max-w-[290px] overflow-hidden rounded-xl border border-[#cdd4ca] bg-[#dce6d8]">
                <ParkMapImage />
                <span
                  aria-hidden
                  style={{ left: `${point.mapX}%`, top: `${point.mapY}%` }}
                  className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#c84d37] shadow-md ring-4 ring-[#c84d37]/20"
                />
                <span
                  style={{
                    left: `${point.mapX}%`,
                    top: `calc(${point.mapY}% + 18px)`,
                  }}
                  className="absolute -translate-x-1/2 whitespace-nowrap rounded-md bg-white/95 px-2 py-1 font-mono text-xs font-bold text-[#17362d] shadow"
                >
                  {bench.code}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#738078]">
                Approximate location for orientation only — not surveyed
                coordinates.
              </p>
            </div>
          )}
        </div>
        {adoption ? (
          <>
            <div className="mt-3 rounded-2xl border border-[#d8d1c3] bg-[#f6f1e8] p-6">
              <p className="text-sm font-semibold uppercase tracking-[.13em] text-[#807261]">
                {adoption.status === "pending"
                  ? `Pending request from ${adoption.donorName}`
                  : `Dedicated by ${adoption.donorName}`}
              </p>
              <blockquote className="mt-4 text-xl italic leading-8 text-[#493f35]">
                “
                {adoption.dedication ||
                  "A place to pause, reflect, and enjoy the park."}
                ”
              </blockquote>
              <p className="mt-5 text-sm text-[#766959]">
                {adoption.status === "pending"
                  ? "Awaiting staff review"
                  : `Adopted through ${formatDate(adoption.adoptedUntil)}`}
              </p>
            </div>
            <WaitlistForm
              bench={bench}
              adoptedUntil={
                adoption.status === "approved" ? adoption.adoptedUntil : null
              }
            />
          </>
        ) : submitted ? (
          <div className="my-4 rounded-2xl bg-[#e4efe5] p-7 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#286144] text-white">
              <Check />
            </span>
            <h3 className="mt-4 text-2xl font-semibold">
              Your bench is reserved
            </h3>
            <p className="mt-2 leading-7 text-[#52675d]">
              Thanks for supporting Van Cortlandt Park. Park staff will contact
              you to confirm the dedication and next steps.
            </p>
            {confirmationCode && (
              <p className="mt-3 font-mono text-sm text-[#315f50]">
                Confirmation: {confirmationCode}
              </p>
            )}
            <Button className="mt-5" onClick={onClose}>
              Back to the park
            </Button>
          </div>
        ) : (
          <AdoptionRequestForm
            bench={bench}
            submit={submit}
            saving={saving}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function WaitlistForm({
  bench,
  adoptedUntil,
}: {
  bench: Bench;
  adoptedUntil: string | null;
}) {
  const [open, setOpen] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [position, setPosition] = useState<number | null>(null);
  const startedAt = useRef(0);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          benchId: bench.id,
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          startedAt: startedAt.current,
        }),
      });
      const text = await response.text();
      const data = text
        ? (JSON.parse(text) as { position?: number; error?: string })
        : {};
      if (!response.ok || !data.position)
        throw new Error(data.error || "Unable to join the waitlist.");
      setPosition(data.position);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to join the waitlist.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (position)
    return (
      <div className="mt-4 rounded-xl border border-[#bad0c1] bg-[#e8f1e9] p-4">
        <p className="flex items-center gap-2 font-semibold text-[#24513f]">
          <Check size={18} />
          You’re on the waitlist at position #{position}
        </p>
        <p className="mt-1 text-sm leading-6 text-[#587066]">
          A confirmation was sent to your email. Staff will contact people in
          order if this bench becomes available.
        </p>
      </div>
    );
  return (
    <div className="mt-4 rounded-xl border border-[#d8d6cb] bg-white/70 p-4">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          startedAt.current = Date.now();
        }}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <span className="flex items-center gap-2 font-semibold text-[#17362d]">
            <UserPlus size={18} />
            Interested in this bench?
          </span>
          <span className="mt-1 block text-sm text-[#68756f]">
            Join the waitlist for when it becomes available.
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3 border-t pt-4">
          <p className="text-sm leading-6 text-[#68756f]">
            {adoptedUntil
              ? `The current term is scheduled through ${formatDate(adoptedUntil)}. It may be renewed.`
              : "This request is awaiting staff review, so an availability date is not known yet."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`wait-name-${bench.id}`}>Your name</Label>
              <Input
                id={`wait-name-${bench.id}`}
                name="name"
                required
                minLength={2}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`wait-email-${bench.id}`}>Email</Label>
              <Input
                id={`wait-email-${bench.id}`}
                name="email"
                type="email"
                required
                maxLength={120}
              />
            </div>
          </div>
          <input
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            name="company"
            aria-hidden="true"
          />
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[#fff0ec] px-3 py-2 text-sm font-semibold text-[#9b3528]"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={saving}
            variant="outline"
            className="w-full"
          >
            {saving ? "Joining…" : "Join this bench’s waitlist"}
          </Button>
          <p className="text-xs leading-5 text-[#77827c]">
            Joining does not reserve the bench. Staff will contact the waitlist
            in order.
          </p>
        </form>
      )}
    </div>
  );
}
