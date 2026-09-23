"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Row = {
  id: number;
  benchId: number;
  donorName: string;
  donorEmail: string;
  dedication: string;
  termYears: number;
  status: string;
  confirmationCode: string | null;
  renewalRequested: boolean;
  adoptedAt: string;
  adoptedUntil: string;
};
type WaitlistRow = {
  id: number;
  benchId: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  adoptedUntil: string | null;
};

export function StaffDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [filter, setFilter] = useState("pending");
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  async function load() {
    setError("");
    const [adoptionResponse, waitlistResponse] = await Promise.all([
      fetch("/api/admin/adoptions", { cache: "no-store" }),
      fetch("/api/admin/waitlist", { cache: "no-store" }),
    ]);
    const adoptionData = await adoptionResponse.json();
    const waitlistData = await waitlistResponse.json();
    if (!adoptionResponse.ok)
      throw new Error(adoptionData.error || "Unable to load requests.");
    if (!waitlistResponse.ok)
      throw new Error(waitlistData.error || "Unable to load waitlist.");
    setRows(adoptionData.adoptions);
    setWaitlist(waitlistData.entries);
  }
  useEffect(() => {
    // Load the two staff queues after the dashboard mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((e) => setError(e.message));
  }, []);
  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          filter === "all" ||
          row.status === filter ||
          (filter === "renewal" && row.renewalRequested),
      ),
    [filter, rows],
  );
  const counts = Object.fromEntries(
    ["pending", "approved", "expired", "renewal", "waitlist"].map((key) => [
      key,
      key === "waitlist"
        ? waitlist.filter((entry) => entry.status === "waiting").length
        : rows.filter((r) =>
            key === "renewal" ? r.renewalRequested : r.status === key,
          ).length,
    ]),
  );
  async function act(id: number, action: string, dedication?: string) {
    setBusy(id);
    setError("");
    try {
      const response = await fetch("/api/admin/adoptions", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action, dedication }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy(null);
    }
  }
  async function actWaitlist(id: number, action: string) {
    setBusy(id);
    setError("");
    try {
      const response = await fetch("/api/admin/waitlist", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Waitlist update failed.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Waitlist update failed.");
    } finally {
      setBusy(null);
    }
  }
  function exportCsv() {
    const cells = [
      "id,bench,status,donor,email,dedication,term_years,expires,confirmation",
      ...visible.map((r) =>
        [
          r.id,
          r.benchId,
          r.status,
          r.donorName,
          r.donorEmail,
          r.dedication,
          r.termYears,
          r.adoptedUntil,
          r.confirmationCode || "",
        ]
          .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
          .join(","),
      ),
    ];
    const url = URL.createObjectURL(
      new Blob([cells.join("\n")], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "bench-adoptions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  const waiting = waitlist.filter((entry) => entry.status !== "removed");
  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#17362d]">
      <header className="border-b bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#728078]">
              Van Cortlandt Park
            </p>
            <h1 className="text-2xl font-semibold">Adoption staff desk</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => load()}>
              <RefreshCw /> Refresh
            </Button>
            <Button onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-3 sm:grid-cols-5">
          {["pending", "approved", "expired", "renewal", "waitlist"].map(
            (key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={
                  "rounded-xl border p-4 text-left " +
                  (filter === key
                    ? "border-[#27614b] bg-[#e4eee7]"
                    : "bg-white")
                }
              >
                <p className="text-2xl font-semibold">{counts[key] || 0}</p>
                <p className="text-sm capitalize text-[#66746e]">{key}</p>
              </button>
            ),
          )}
        </div>
        <div className="my-5 flex items-center justify-between">
          <p className="text-sm text-[#66746e]">
            {filter === "waitlist" ? waiting.length : visible.length} records
            shown
          </p>
          <button
            className="text-sm font-semibold underline"
            onClick={() => setFilter("all")}
          >
            Show all adoptions
          </button>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <div className="space-y-3">
          {filter === "waitlist"
            ? waiting.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border bg-[#fffdf8] p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-[#315f50]">
                        VCP-{String(entry.benchId).padStart(3, "0")} · Queue #
                        {
                          waitlist.filter(
                            (item) =>
                              item.benchId === entry.benchId &&
                              item.createdAt <= entry.createdAt &&
                              item.status === "waiting",
                          ).length
                        }
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        {entry.name}
                      </h2>
                      <a
                        className="text-sm text-[#47685d] underline"
                        href={"mailto:" + entry.email}
                      >
                        {entry.email}
                      </a>
                    </div>
                    <div className="text-right text-sm text-[#66746e]">
                      <p>
                        {entry.status === "contacted" ? "Contacted" : "Waiting"}
                      </p>
                      <p>
                        {entry.adoptedUntil
                          ? `Current term ends ${entry.adoptedUntil}`
                          : "No current end date"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.status === "waiting" ? (
                      <Button
                        disabled={busy === entry.id}
                        onClick={() => actWaitlist(entry.id, "contacted")}
                      >
                        Mark contacted
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled={busy === entry.id}
                        onClick={() => actWaitlist(entry.id, "waiting")}
                      >
                        Return to waiting
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      disabled={busy === entry.id}
                      onClick={() => actWaitlist(entry.id, "remove")}
                    >
                      Remove
                    </Button>
                  </div>
                </article>
              ))
            : visible.map((row) => (
                <article
                  key={row.id}
                  className="rounded-2xl border bg-[#fffdf8] p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-[#315f50]">
                        VCP-{String(row.benchId).padStart(3, "0")} ·{" "}
                        {row.status}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        {row.donorName}
                      </h2>
                      <a
                        className="text-sm text-[#47685d] underline"
                        href={"mailto:" + row.donorEmail}
                      >
                        {row.donorEmail}
                      </a>
                    </div>
                    <div className="text-right text-sm text-[#66746e]">
                      <p>Ends {row.adoptedUntil}</p>
                      <p>{row.termYears}-year term</p>
                      {row.renewalRequested && (
                        <strong className="text-[#9a5a16]">
                          Renewal requested
                        </strong>
                      )}
                    </div>
                  </div>
                  <Textarea
                    className="mt-4 bg-white"
                    defaultValue={row.dedication}
                    id={"dedication-" + row.id}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      disabled={busy === row.id}
                      onClick={() =>
                        act(
                          row.id,
                          "update",
                          (
                            document.getElementById(
                              "dedication-" + row.id,
                            ) as HTMLTextAreaElement
                          ).value,
                        )
                      }
                    >
                      Save dedication
                    </Button>
                    {row.status === "pending" && (
                      <>
                        <Button
                          disabled={busy === row.id}
                          onClick={() => act(row.id, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={busy === row.id}
                          onClick={() => act(row.id, "reject")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {(row.status === "expired" || row.renewalRequested) && (
                      <Button
                        disabled={busy === row.id}
                        onClick={() => act(row.id, "renew")}
                      >
                        Renew
                      </Button>
                    )}
                  </div>
                </article>
              ))}
        </div>
      </main>
    </div>
  );
}
