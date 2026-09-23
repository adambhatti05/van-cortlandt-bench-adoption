import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adoptions } from "@/db/schema";
import { RenewalForm } from "@/components/renewal-form";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = decodeURIComponent(code).toUpperCase();
  const [record] = await getDb()
    .select({
      benchId: adoptions.benchId,
      status: adoptions.status,
      adoptedUntil: adoptions.adoptedUntil,
      confirmationCode: adoptions.confirmationCode,
    })
    .from(adoptions)
    .where(eq(adoptions.confirmationCode, normalized))
    .limit(1);

  return (
    <main className="min-h-screen px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm font-semibold text-[#315f50] hover:underline"
        >
          ← Back to benches
        </Link>
        <section className="mt-6 rounded-3xl border bg-[#fffdf8] p-7 shadow-[0_18px_45px_rgba(25,63,49,.08)] sm:p-10">
          {record ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[.14em] text-[#708078]">
                Request reference
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {record.confirmationCode}
              </h1>
              <div className="mt-7 grid gap-3 rounded-2xl bg-[#edf1ea] p-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#748078]">
                    Bench
                  </p>
                  <p className="mt-1 font-semibold">
                    VCP-{String(record.benchId).padStart(3, "0")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#748078]">
                    Status
                  </p>
                  <p className="mt-1 font-semibold capitalize">
                    {record.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#748078]">
                    Term ends
                  </p>
                  <p className="mt-1 font-semibold">{record.adoptedUntil}</p>
                </div>
              </div>
              <p className="mt-6 leading-7 text-[#5c6b64]">
                Save this reference. A pending request holds the bench while
                park staff reviews the dedication and contacts the donor.
              </p>
              {(record.status === "approved" ||
                record.status === "expired") && (
                <div className="mt-8 border-t pt-7">
                  <h2 className="text-xl font-semibold">Renew this adoption</h2>
                  <p className="mb-4 mt-1 text-sm text-[#68756f]">
                    Verify the original email to send a renewal request to
                    staff.
                  </p>
                  <RenewalForm
                    defaultCode={record.confirmationCode || normalized}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold">Reference not found</h1>
              <p className="mt-3 text-[#66746e]">
                Check the confirmation code or return to the bench directory.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
