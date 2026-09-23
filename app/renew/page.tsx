import Link from "next/link";
import { RenewalForm } from "@/components/renewal-form";

export default function RenewPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f3eb] p-5">
      <section className="w-full max-w-lg rounded-2xl border bg-[#fffdf8] p-7 shadow-sm">
        <Link
          href="/"
          className="inline-flex rounded-md px-1 py-1 text-sm font-semibold text-[#315f50] underline hover:bg-[#e9eee9]"
        >
          ← Back to bench directory
        </Link>
        <p className="mt-7 text-xs font-bold uppercase tracking-[.15em] text-[#728078]">
          Existing adoption
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#17362d]">
          Request a renewal
        </h1>
        <p className="mt-3 leading-7 text-[#66746e]">
          Enter the confirmation code and email from your adoption. Staff will
          review the request before extending the term.
        </p>
        <div className="mt-6">
          <RenewalForm />
        </div>
      </section>
    </main>
  );
}
