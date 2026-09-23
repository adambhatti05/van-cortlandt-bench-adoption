# Van Cortlandt Park Bench Adoption

Live site: [vancortlandpark.org](https://vancortlandpark.org)

This is my take-home for Columbia Software Solutions (option 2, Bench Adoption). The park has 500+ benches and no single place to see which ones are adopted, by whom, and for how long. This site is meant to be that place. Visitors can browse benches and request one, and staff can review those requests.

It's a student prototype. It isn't affiliated with NYC Parks or the Van Cortlandt Park Alliance.

## What it does

For visitors:
- Browse all 500 benches as a list or on the park map, and search or filter by area and status
- See who adopted a bench, their dedication, and when the adoption ends
- Request an available bench for any length from 1 month to 50 years, with a preview of the plaque text
- Join a waitlist for a bench that's already taken

For staff (behind a login at `/staff`):
- Approve or reject requests, handle renewals, and export adoptions
- See the waitlist for each bench
- Drag bench markers to fix their spots on the map

There's no payment, per the prompt.

## How an adoption works

1. Someone picks an available bench and fills out the form.
2. The server checks the input and makes sure the bench isn't already taken, then saves the request as **pending**.
3. The person gets a confirmation email and staff get notified.
4. Staff approve or reject it. A rejected request frees the bench. An approved one keeps it until the adoption expires or gets renewed.

## Assumptions

In a real project I'd confirm these with the park before building. Since I couldn't, here's what I went with:

- **The bench data is made up.** I didn't have the park's real inventory, so the bench numbers, areas and existing adoptions are sample data (`lib/sample-inventory.ts`). It fills the directory in without writing fake rows to the database, and real records always take priority. With real data, I'd import the park's inventory and delete that file.
- **An online request isn't a final adoption.** I assumed payment and plaque wording get sorted out offline, so everything starts as pending until staff approve it.
- **One active adoption per bench.**
- **Names and dedications are public, emails aren't.** The public API never returns donor emails.
- **The photos are placeholders.**

## Design decisions

- **Benches live in code, adoptions live in the database.** The bench list barely changes, and adoptions are the data that actually changes, so only adoptions (plus waitlist entries and map positions) go in the database.
- **Double-booking is blocked in two places.** The API checks first so it can show a clear error message. The database also has a unique constraint on `bench_id`, which catches the case where two people submit at the same moment and both pass the first check.
- **Staff login is intentionally simple.** It's one username and password stored as environment variables, with a signed, HTTP-only cookie for the session. That's enough for a small staff team. A real deployment would want individual staff accounts.
- **Basic spam protection.** Public forms have a hidden honeypot field, a check that rejects forms submitted too fast, and a limit of a few requests per email per day.
- **I put extra time into the map.** When you're choosing a bench, where it is matters most, so the map felt worth it.

## What I'd do next

- Import the real bench inventory and GPS locations
- Add real photos of each bench
- Give each staff member their own account instead of one shared login
- Add automated tests, especially for the double-booking case
- Add payment if the park wanted to take it online

## Tech

Next.js, React and TypeScript, Tailwind CSS, Cloudflare D1 (SQLite) with Drizzle ORM, and Resend for email. It's hosted on OpenAI Sites.

I used AI tools (ChatGPT) to speed up parts of the build. The decisions above are mine, and I tested the adoption flow end to end myself. Friends also tested the live site and caught a few bugs, which I fixed.

## Running it locally

You'll need Node.js 22.13+ and pnpm.

```bash
corepack enable
pnpm install
cp .env.example .env.local   # fill in your own values
pnpm dev
```

`.env.example` lists the settings the app needs: the email API key and addresses, plus the staff username, password and session secret. The repo only has placeholders. Real values go in your environment and never get committed.

## Where things are

| Path | What's there |
| --- | --- |
| `app/api/adoptions/route.ts` | Public API for reading and creating adoptions, including validation and the double-booking check |
| `components/bench/bench-directory.tsx` | The main page: list, map, filters and the bench popup |
| `components/bench/adoption-request-form.tsx` | The adoption form and plaque preview |
| `components/staff/staff-dashboard.tsx` | Staff dashboard |
| `lib/staff-auth.ts` | Staff login and signed session cookie |
| `lib/email.ts` | Confirmation and staff-notification emails |
| `db/schema.ts` | Database tables |
| `drizzle/` | Database migrations. The odd filenames are auto-generated. |
