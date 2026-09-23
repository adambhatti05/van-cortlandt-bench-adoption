"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Bench } from "@/lib/benches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdoptionRequestForm({
  bench,
  submit,
  saving,
  error,
}: {
  bench: Bench;
  submit: (event: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  error: string;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [years, setYears] = useState(5);
  const [months, setMonths] = useState(0);

  function updateYears(nextYears: number) {
    const boundedYears = Math.max(0, Math.min(50, nextYears));
    setYears(boundedYears);
    if (boundedYears === 50) setMonths(0);
  }

  const parts = [
    years ? years + " year" + (years === 1 ? "" : "s") : "",
    months ? months + " month" + (months === 1 ? "" : "s") : "",
  ].filter(Boolean);
  const term = parts.join(" + ") || "Choose a term";
  return (
    <form onSubmit={submit} className="mt-3 space-y-5">
      <input
        name="company"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      <p className="rounded-xl bg-[#edf1ea] px-4 py-3 text-sm leading-6 text-[#53645c]">
        Preview the plaque and choose a custom adoption term. Staff will confirm
        the final wording before production.
      </p>
      <div className="rounded-2xl bg-gradient-to-br from-[#b68b45] via-[#d1ad68] to-[#8c672f] p-1 shadow-[inset_0_1px_2px_rgba(255,255,255,.55),0_12px_30px_rgba(65,43,17,.18)]">
        <div className="min-h-40 rounded-xl border border-[#6f4e22]/50 bg-[#b98a43] px-8 py-7 text-center text-[#2d2112] shadow-[inset_0_0_18px_rgba(74,42,10,.28)]">
          <p className="text-[10px] font-bold uppercase tracking-[.24em]">
            Van Cortlandt Park
          </p>
          <p className="mx-auto mt-4 max-w-sm whitespace-pre-wrap font-serif text-lg font-semibold leading-6">
            {message || "Your dedication will appear here"}
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-[.16em]">
            {name ? "Dedicated by " + name : "Donor name"}
          </p>
        </div>
      </div>
      <p className="-mt-2 text-center text-xs text-[#77827c]">
        Digital preview only · Final plaque layout is approved by park staff
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="donorName">Donor or family name</Label>
          <Input
            id="donorName"
            name="donorName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
            placeholder="The Rivera Family"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="donorEmail">Contact email</Label>
          <Input
            id="donorEmail"
            name="donorEmail"
            type="email"
            required
            maxLength={120}
            placeholder="name@example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <Label htmlFor="termYears">Custom duration</Label>
          <strong className="text-sm text-[#315f50]">{term}</strong>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Years</p>
              <p className="text-xs text-[#77827c]">
                Choose any whole number from 0 to 50.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Remove one year"
                onClick={() => updateYears(years - 1)}
                className="grid h-9 w-9 place-items-center rounded-full border hover:bg-[#edf1ea]"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-lg font-bold">{years}</span>
              <button
                type="button"
                aria-label="Add one year"
                onClick={() => updateYears(years + 1)}
                className="grid h-9 w-9 place-items-center rounded-full border hover:bg-[#edf1ea]"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <input
            id="termYears"
            name="termYears"
            type="range"
            min="0"
            max="50"
            step="1"
            value={years}
            onChange={(e) => updateYears(Number(e.target.value))}
            className="mt-4 w-full accent-[#174f3d]"
          />
          <div className="mt-1 flex justify-between text-[10px] font-semibold text-[#859087]">
            <span>0 years</span>
            <span>50 years</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="termMonths">Additional months</Label>
            <p className="text-xs text-[#77827c]">
              {years === 50
                ? "The total term is capped at 50 years."
                : "Fine-tune the term from 0 to 11 months."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Remove one month"
              disabled={years === 50}
              onClick={() => setMonths(Math.max(0, months - 1))}
              className="grid h-9 w-9 place-items-center rounded-full border hover:bg-[#edf1ea] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-lg font-bold">{months}</span>
            <button
              type="button"
              aria-label="Add one month"
              disabled={years === 50}
              onClick={() => setMonths(Math.min(11, months + 1))}
              className="grid h-9 w-9 place-items-center rounded-full border hover:bg-[#edf1ea] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <input
          id="termMonths"
          name="termMonths"
          type="range"
          min="0"
          max="11"
          step="1"
          value={months}
          disabled={years === 50}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="mt-4 w-full accent-[#174f3d] disabled:opacity-40"
        />
        <div className="mt-1 flex justify-between text-[10px] font-semibold text-[#859087]">
          <span>0 months</span>
          <span>11 months</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="dedication">Dedication</Label>
          <span className="text-xs text-[#77827c]">{message.length}/180</span>
        </div>
        <Textarea
          id="dedication"
          name="dedication"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={180}
          rows={3}
          placeholder="In loving memory of…"
        />
      </div>
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
        disabled={saving || (years === 0 && months === 0)}
        className="h-11 w-full bg-[#174f3d] text-base hover:bg-[#123f31]"
      >
        {saving
          ? "Submitting request…"
          : "Request " + bench.code + " for " + term}
      </Button>
    </form>
  );
}
