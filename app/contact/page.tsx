import Link from "next/link";
import { Mail, Trees } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f6f3eb] px-5 py-10 text-[#17362d]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex rounded-md px-1 py-1 text-sm font-semibold text-[#315f50] underline hover:bg-[#e9eee9]"
        >
          ← Back to bench directory
        </Link>
        <section className="mt-6 overflow-hidden rounded-2xl border border-[#d5d4ca] bg-[#fffdf8] shadow-sm">
          <header className="border-b border-[#d8d6cb] bg-[#edf1ea] p-7 sm:p-9">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#174f3d] text-white">
              <Trees size={22} />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.15em] text-[#728078]">
              Van Cortlandt Park
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Contact us
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-[#66746e]">
              Questions about a bench, an existing request, or the website? Send
              a message to the project team.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#315f50]">
              <Mail size={16} />
              Messages go directly to the park project inbox.
            </p>
          </header>
          <div className="p-7 sm:p-9">
            <ContactForm />
          </div>
        </section>
      </div>
    </main>
  );
}
