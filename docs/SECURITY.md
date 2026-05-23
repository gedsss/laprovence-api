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

## Required Checks

Every pull request should include:

- Dependency audit.
- Secret scan.
- Typecheck or build.
- Review of changed public API routes.
- Review of logs and error responses for sensitive data exposure.

