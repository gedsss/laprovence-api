# Codex Rules

All code changes must follow LGPD, OWASP Top 10, ISO 27001-aligned controls, and least privilege.

## Never Generate

- Hardcoded passwords, API keys, tokens, or real credentials.
- Authentication bypasses.
- Logs containing CPF, full JWTs, Authorization headers, cookies, or payment payloads.

## Always Prefer

- Input validation with typed schemas.
- Generic external error responses.
- Environment variables or managed secrets.
- Timeouts and rate limits for public flows.
- Structured logs with sensitive fields omitted or redacted.

