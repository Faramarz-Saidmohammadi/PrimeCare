# Verification Report

Verified on 2026-08-30.

## Clean toolchain verification

- Node.js `22.23.2` and npm `10.9.4`
- Clean `npm ci` installation
- TypeScript semantic check passed
- ESLint passed with zero errors and zero warnings
- 24 Vitest unit and security tests passed across six test files
- Next.js `16.3.3` production build passed
- Full and production-only npm audits reported zero vulnerabilities

## Runtime workflow verification

The application was started without MongoDB or email credentials to verify its documented development fallback. The following boundaries passed:

- Home page returned `200` with `SAMEORIGIN` and `nosniff` security headers.
- Health endpoint returned `200` and accurately reported `demo-mode` persistence and unconfigured email.
- Production database policy rejected a missing `MONGODB_URI`; the health endpoint returned `503` with `database: not-configured`.
- Availability returned five open weekday slots with the configured capacity.
- Three concurrent requests for a two-place slot returned `201`, `201`, and `409`; overbooking was rejected.
- Patient lookup returned the matching appointment.
- Patient cancellation changed the status to `cancelled` and released one place.
- Invalid contact input returned `400` with validation errors.
- Unauthenticated admin access and invalid credentials returned `401`.
- Valid admin login returned a signed session cookie; protected statistics and content endpoints returned `200`.
- The reminder cron endpoint rejected a request without its secret with `401`.
- Server output contained no application errors during the workflow.

## Browser suite

Playwright discovers six scenarios across desktop and mobile Chromium profiles:

- public home and appointment entry points;
- patient booking, lookup, and cancellation;
- administrator authentication and dashboard access.

The current workspace could not download the Chromium binary because the browser CDN returned truncated downloads. GitHub Actions installs Chromium and runs all six scenarios in a clean Linux runner before merge. A local browser pass is therefore not claimed in this report.

## External-service scope

MongoDB persistence, Resend delivery, and Vercel Cron execution require non-production service credentials and were not exercised in this credential-free audit environment.
