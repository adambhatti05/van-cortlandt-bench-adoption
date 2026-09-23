"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RenewalForm({ defaultCode = "" }: { defaultCode?: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/renewals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        confirmationCode: form.get("confirmationCode"),
        donorEmail: form.get("donorEmail"),
        company: form.get("company"),
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      alreadyRequested?: boolean;
    };
    if (!response.ok) setError(data.error || "Unable to request renewal.");
    else
      setMessage(
        data.alreadyRequested
          ? "A renewal request is already on file."
          : "Renewal requested. Park staff will follow up.",
      );
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="renew-company">Company</Label>
        <Input
          id="renew-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="renew-code">Confirmation code</Label>
        <Input
          id="renew-code"
          name="confirmationCode"
          defaultValue={defaultCode}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="renew-email">Email used for adoption</Label>
        <Input id="renew-email" name="donorEmail" type="email" required />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-[#fff0ec] px-3 py-2 text-sm font-semibold text-[#9b3528]"
        >
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-[#e5f0e7] px-3 py-2 text-sm font-semibold text-[#24563d]">
          {message}
        </p>
      )}
      <Button disabled={saving} className="w-full">
        {saving ? "Submitting…" : "Request renewal"}
      </Button>
    </form>
  );
}
