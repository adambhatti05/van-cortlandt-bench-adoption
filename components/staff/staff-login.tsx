"use client";
import Link from "next/link";
import { useState } from "react";
import { Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function StaffLogin() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    if (response.ok) window.location.replace("/staff");
    else {
      const data = await response.json();
      setError(data.error || "Login failed.");
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f3eb] p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border bg-[#fffdf8] p-8 shadow-lg"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#174f3d] text-white">
          <Trees />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.15em] text-[#728078]">
          Van Cortlandt Park
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-[#17362d]">
          Staff login
        </h1>
        <p className="mt-2 text-sm text-[#66746e]">
          Authorized park staff only.
        </p>
        <div className="mt-6 space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            autoFocus
          />
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <Button className="mt-6 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <Link
          href="/"
          className="mt-5 block text-center text-sm font-semibold text-[#315f50] underline"
        >
          Back to bench directory
        </Link>
      </form>
    </main>
  );
}
