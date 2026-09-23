# Van Cortlandt Park Bench Adoption

A full-stack prototype for exploring park benches, requesting a dedication, joining a waitlist, and reviewing requests from a staff dashboard.

Live site: [vancortlandpark.org](https://vancortlandpark.org)

## What the site does

- Displays 500 benches in a searchable list and on the official park map
- Shows available, pending, and adopted states consistently
- Lets visitors preview plaque text and request any duration from one month to 50 years
- Sends confirmation and staff-notification emails through Resend
- Adds a waitlist to pending or adopted benches
- Lets staff approve, reject, renew, and export adoption requests
- Lets staff correct approximate marker positions
- Supports installation as a progressive web app and has an offline page

No payment is collected. A submitted request remains pending until park staff reviews it.

## Technology

- Next.js, React, and TypeScript
- Tailwind CSS
- Cloudflare D1 with Drizzle ORM
- Resend for transactional email
- OpenAI Sites for hosting

## Project structure

```text
app/
  api/                      Server routes for public and staff actions
  contact/                  Contact page
  renew/                    Renewal page
  staff/                    Staff login and dashboard entry point
components/
  bench/                    Directory, map, and adoption request form
  staff/                    Staff dashboard, login, and map editor
  ui/                       Five shared interface primitives used by the app
db/                         Database connection and schema
drizzle/                    Applied database migrations
lib/                        Bench data, email, authentication, and helpers
public/                     Park images, map, icons, manifest, and service worker
```

Next.js requires filenames such as `page.tsx`, `layout.tsx`, and `route.ts`. The descriptive folder names tell you what each of those framework files handles. Drizzle generated the migration filenames; they are intentionally unchanged so deployed database history remains valid.

## Run locally

Requirements: Node.js 22.13 or newer and pnpm.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

The production build and code-quality checks are:

```bash
pnpm lint
pnpm format:check
pnpm build
```

## Configuration

Copy `.env.example` to `.env.local`, then provide:

- `RESEND_API_KEY` — Resend API key
- `EMAIL_FROM` — verified sender on the Resend domain
- `EMAIL_REPLY_TO` — inbox that should receive replies
- `STAFF_NOTIFICATION_EMAIL` — inbox for new requests and contact messages
- `STAFF_USERNAME` and `STAFF_PASSWORD` — staff dashboard credentials
- `STAFF_SESSION_SECRET` — long random value used to sign staff sessions

The D1 binding is named `DB` and is supplied by the hosting environment.

## Data model

The main tables are:

- `adoptions` — request status, donor details, dedication, duration, and confirmation code
- `bench_locations` — staff-adjusted map coordinates
- `waitlist_entries` — ordered interest for unavailable benches

`lib/sample-inventory.ts` fills the prototype directory to a baseline of 200 adopted benches and 6 pending benches without inserting fictional records into D1. Real database records take priority. In a production handoff, this module would be removed after importing the park's authoritative inventory.

## Request flow

1. A visitor selects an available bench and submits a dedication request.
2. The server validates the input, prevents duplicate active requests, and stores it as pending.
3. Resend sends the visitor a confirmation and notifies staff.
4. Staff approves or rejects the request from the protected dashboard.
5. Rejected requests stop blocking the bench; approved requests remain unavailable until expiration or renewal.

## Security notes

- Staff credentials and email keys are environment variables, never browser code.
- Staff sessions use an HTTP-only signed cookie.
- Public forms include server-side validation, a timing check, a honeypot field, and basic submission limits.
- The repository contains placeholders only. Do not commit real secrets.

## Main files to discuss in a review

- `components/bench/bench-directory.tsx` — visitor-facing search, filters, list, map, and bench dialog
- `components/bench/adoption-request-form.tsx` — plaque preview and custom duration controls
- `app/api/adoptions/route.ts` — public adoption read/write API and validation
- `components/staff/staff-dashboard.tsx` — staff workflow
- `lib/staff-auth.ts` — signed staff sessions
- `lib/email.ts` — Resend email integration
- `db/schema.ts` — persistent data model

This is a portfolio prototype, not an official Van Cortlandt Park or Van Cortlandt Park Alliance service.
