# Contributing

Use focused branches from the latest `main` and submit changes through pull requests.

Before opening a pull request, run:

```bash
npm ci
npm run check
```

For changes affecting appointments, persistence, admin access, email delivery, or cron reminders, also test the relevant workflow against non-production services.

Pull requests should describe the problem, scope, user-visible impact, security/data impact, verification performed, and any deployment or rollback considerations.

Never commit real patient data, production credentials, API keys, session material, or database connection strings. Follow `SECURITY.md` for vulnerability handling.

Prefer concise commit messages such as:

```text
feat: add appointment status filter
fix: prevent slot overbooking
ci: add production quality gate
docs: document deployment checks
```
