"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          topic: form.get("topic"),
          message: form.get("message"),
          company: form.get("company"),
          startedAt: startedAt.current,
        }),
      });
      const text = await response.text();
      const data = text ? (JSON.parse(text) as { error?: string }) : {};
      if (!response.ok)
        throw new Error(data.error || "Unable to send your message.");
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send your message.",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent)
    return (
      <div className="rounded-2xl bg-[#e4efe5] p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#286144] text-white">
          <Check />
        </span>
        <h2 className="mt-4 text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 leading-7 text-[#52675d]">
          Your message was delivered to the Van Cortlandt Park project inbox. We
          also sent a confirmation to the email address you provided.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => {
            setSent(false);
            startedAt.current = Date.now();
          }}
        >
          Send another message
        </Button>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Your name</Label>
          <Input
            id="contact-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={120}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-topic">What can we help with?</Label>
        <select
          id="contact-topic"
          name="topic"
          required
          defaultValue=""
          className="h-11 w-full rounded-[var(--radius-md)] border border-input bg-white px-3 text-base outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>
            Select a topic
          </option>
          <option>Bench adoption</option>
          <option>Existing adoption</option>
          <option>Bench location</option>
          <option>Website feedback</option>
          <option>Other</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={7}
          placeholder="Tell us how we can help…"
        />
        <p className="text-xs text-[#77827c]">
          Please do not include payment details or other sensitive information.
        </p>
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
        disabled={sending}
        className="h-11 w-full bg-[#174f3d] text-base hover:bg-[#123f31]"
      >
        <Send />
        {sending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
