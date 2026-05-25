# Security Policy

## Scope

This repository follows LGPD, OWASP Top 10, ISO 27001-aligned controls, Privacy by Design, Security by Design, and least privilege.

Security decisions must prioritize, in order:

1. Protection of personal data.
2. Payment and authentication integrity.
3. Traceability and auditability.
4. Data minimization.
5. Operational reliability.

## Sensitive Data

Never store or log:

- Plaintext passwords.
- Full JWTs or reset tokens.
- Full CPF values.
- Payment card data or PagBank encrypted card payloads.
- Authorization headers, cookies, or API credentials.

Sensitive values must be provided through environment variables or managed secrets. Production data must not be copied into development without anonymization.

## Logging

Logs must mask or omit CPF, email, phone, tokens, cookies, authorization headers, and payment data. Application errors returned to clients must not expose stack traces, adapters, SQL, or third-party payloads.

## Authentication

- Passwords must be hashed with a current adaptive hash.
- JWT secrets must be strong and mandatory outside local development.
- Password reset tokens must be stored hashed and expire quickly.
- Privileged routes must enforce both authentication and authorization.

## Payments

PagBank requests must avoid logging customer PII and card payloads. Webhooks must validate authenticity when the provider sends the signature header. Public checkout flows must use rate limiting and bot protection in homologation and production.

## Implemented API Controls

- Public list lookup returns display fields only; phone and ownership identifiers are not public.
- Public gift availability returns only catalog item identifiers and payment status.
- Checkout creates a random one-time access credential whose SHA-256 hash is stored; subsequent PagBank session, order, status, and cancellation calls require the credential in `X-Checkout-Token`.
- Purchase history and CPF lookup require authentication and ownership or gestor authorization.
- Catalog, preassembled-list, and administrative list mutations require the `gestor` role.
- Web authentication is kept in an `HttpOnly`, `SameSite=Strict` session cookie; authenticated mutations require an explicit CSRF-protection header.
- Third-party payment responses and unhandled stack traces are omitted from runtime logs and client errors.

## Production Blockers

- Define and execute retention, export, correction, and deletion procedures for LGPD data subject requests before retaining real customer records.
- Deploy only behind HTTPS with `NODE_ENV=production`, an explicit `CORS_ORIGINS`, and `TRUST_PROXY` configured for the known reverse proxy hop count.

## Required Checks

Every pull request should include:

- Dependency audit.
- Secret scan.
- Typecheck or build.
- Review of changed public API routes.
- Review of logs and error responses for sensitive data exposure.

