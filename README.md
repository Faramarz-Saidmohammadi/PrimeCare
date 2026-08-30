# PrimeCare Dental Clinic Platform

Full-stack dental clinic platform built with Next.js, React, TypeScript, MongoDB, and Mongoose. It combines a public clinic website, appointment scheduling, patient self-service, content management, operational notifications, and a protected administration workspace.

The interface is implemented in original application code. Third-party commercial theme packages are not included in this repository.

## Product capabilities

### Public experience

- Responsive Home, About, Services, Doctors, Gallery, Blog, Contact, Appointment, Privacy, and Terms pages
- Dynamic services, clinician profiles, articles, clinic information, opening hours, and social links
- Accessible navigation, mobile interactions, FAQ/testimonial experiences, reduced-motion support, and loading/error states
- SEO metadata, sitemap, robots directives, web manifest, Open Graph assets, optimized images, and security headers

### Appointment workflow

- Live date and time availability
- Configurable booking horizon and per-slot capacity
- Clinic-specific weekday and weekend scheduling rules
- Atomic MongoDB reservation logic to protect against concurrent overbooking
- Optional clinician selection
- Patient details, visit reason, notes, consent, and spam protection
- 64-bit random appointment reference and secure cancellation token
- Patient appointment lookup and self-cancellation
- Status lifecycle: `pending → confirmed → completed/cancelled`
- Administrative phone/walk-in booking and rescheduling with availability revalidation
- Manual reminders and scheduled reminder processing through Vercel Cron
- Optional confirmation, status-change, and reminder email delivery

### Administration

- Signed HTTP-only administrator sessions
- Constant-time credential comparison
- Protected administrative API routes
- Dashboard statistics
- Appointment search, filters, pagination, editing, notes, reminders, CSV export, and deletion
- Contact-message inbox with status, internal notes, search, and deletion
- CRUD management for services, doctors, and blog posts
- Clinic profile, contact information, hours, and social-link management
- Controlled API errors and server-side input validation

## Engineering stack

| Layer | Technology |
| --- | --- |
| Application | Next.js App Router, React 19, TypeScript |
| API | Next.js Route Handlers |
| Persistence | MongoDB, Mongoose |
| Email | Resend-compatible delivery integration |
| Scheduling | Vercel Cron |
| Quality | TypeScript, ESLint, Vitest, Playwright, production builds, GitHub Actions |

## Operational design

- MongoDB connection reuse for serverless execution
- Development-only in-memory fallback when MongoDB is not configured
- Health endpoint at `/api/health`
- Abuse-rate limiting on sensitive public and authentication flows
- Seed script for development data
- Global loading and error boundaries
- Environment-specific configuration kept outside source control

## Local development

Requirements:

- Node.js 22+
- MongoDB Atlas or another compatible MongoDB deployment for persistent data

```bash
cp .env.example .env.local
npm ci
npm run seed   # optional development data
npm run dev
```

Open `http://localhost:3000`.

## Environment configuration

Use `.env.example` as the configuration contract. Production secrets must be configured outside GitHub.

Important variables include:

```dotenv
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/primecare?retryWrites=true&w=majority
ADMIN_EMAIL=admin@primecare.test
ADMIN_PASSWORD=replace-with-a-long-unique-password
AUTH_SECRET=replace-with-a-random-value-at-least-64-characters-long
NEXT_PUBLIC_SITE_URL=https://your-domain.example
CLINIC_TIME_ZONE=Asia/Kabul
APPOINTMENT_SLOT_CAPACITY=2
APPOINTMENT_HORIZON_DAYS=180
RESEND_API_KEY=
NOTIFICATION_EMAIL=
EMAIL_FROM=PrimeCare <appointments@your-domain.com>
CRON_SECRET=replace-with-a-long-random-secret
```

## Important routes

| Purpose | Route |
| --- | --- |
| Book appointment | `/appointment` |
| Find/cancel appointment | `/appointment/manage` |
| Admin login | `/admin/login` |
| Admin dashboard | `/admin` |
| Health check | `/api/health` |
| Reminder cron | `/api/cron/reminders` |

## Quality gate

Run before merge:

```bash
npm run check
npm run test:e2e
```

`npm run check` performs TypeScript validation, ESLint, 24 unit and security tests, and a production Next.js build. `npm run test:e2e` exercises the public booking journey and administrator authentication with desktop and mobile Chromium profiles.

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the command environment before running the browser suite. The tests intentionally contain no fallback administrator credentials.

GitHub Actions performs a clean dependency installation, production dependency audit, the full quality gate, and all six browser scenarios for pull requests and updates to `main`.

Changes affecting appointments, persistence, authentication, email, or scheduled reminders should also be exercised against the relevant non-production service dependency.

## Persistence modes

- **Persistent mode:** configure `MONGODB_URI`; data is stored in MongoDB and booking constraints are enforced through the persistent data model.
- **Development fallback:** omit `MONGODB_URI`; data is process-local and may reset after restart or serverless cold start. This mode is not suitable for a live clinic.
- **Production safety:** production requests fail with a service error when `MONGODB_URI` is missing. Patient and administrative data are never silently accepted into temporary memory in production.

## Deployment

The intended production target is Vercel with MongoDB Atlas and optional Resend email delivery.

Before production release:

1. configure all environment variables in the deployment platform;
2. replace placeholder clinic contact details and role-based team profiles with verified information;
3. set `NEXT_PUBLIC_SITE_URL` to the production origin;
4. verify `/api/health` reports the database as connected;
5. test appointment creation, lookup, cancellation, and rescheduling;
6. test admin authentication and content-management workflows;
7. verify reminder processing and email delivery when enabled.

`vercel.json` contains the scheduled reminder configuration.

## Repository standards

- [Security policy](SECURITY.md)
- [Contribution workflow](CONTRIBUTING.md)

Do not commit real patient data, credentials, API keys, database URLs, or session material.
