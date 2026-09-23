import { cookies } from "next/headers";
const COOKIE_NAME = "vcp_staff_session";
const SESSION_SECONDS = 60 * 60 * 12;
function env(name: string) {
  return process.env[name] || "";
}
async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env("STAFF_SESSION_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
export async function createStaffSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const value = String(expires);
  (await cookies()).set(COOKIE_NAME, value + "." + (await sign(value)), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}
export async function clearStaffSession() {
  (await cookies()).delete(COOKIE_NAME);
}
export async function isStaffAuthenticated() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !env("STAFF_SESSION_SECRET")) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000)
    return false;
  return signature === (await sign(expires));
}
export function validStaffCredentials(username: unknown, password: unknown) {
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    username === env("STAFF_USERNAME") &&
    password === env("STAFF_PASSWORD")
  );
}
export async function requireAdminApi() {
  if (!(await isStaffAuthenticated()))
    return {
      response: Response.json(
        { error: "Staff authorization required." },
        { status: 401 },
      ),
    };
  return { response: null };
}
