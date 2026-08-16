# Security Policy

Report suspected vulnerabilities privately rather than through public issues. Include affected routes/workflows, reproducible steps, impact, and sanitized evidence.

Never include passwords, API keys, session cookies, patient information, medical references, appointment cancellation tokens, database URLs, or other confidential data in reports.

Contributors must keep secrets outside the repository, preserve server-side authorization on admin routes, validate public input, avoid logging sensitive patient data, and review changes that affect appointment capacity, cancellation, reminders, sessions, or administrative access with particular care.

If a credential is committed accidentally, revoke and rotate it immediately; deleting it from the latest commit is not sufficient because it may remain in Git history.
