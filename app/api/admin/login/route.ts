import { createStaffSession, validStaffCredentials } from "@/lib/staff-auth";
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  if (!validStaffCredentials(body.username, body.password))
    return Response.json(
      { error: "Incorrect username or password." },
      { status: 401 },
    );
  await createStaffSession();
  return Response.json({ ok: true });
}
