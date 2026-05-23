# Privacy By Design

## Principles

- Default to collecting less data.
- Keep public endpoints narrow and rate limited.
- Keep payment and identity data out of logs.
- Use explicit environment configuration for integrations.
- Fail closed when mandatory secrets are missing.

## Engineering Checklist

- Validate input at route boundaries.
- Return generic errors for authentication and infrastructure failures.
- Avoid exposing user records beyond the current user's authorization scope.
- Avoid storing tokens in plaintext.
- Document any new personal data field with purpose and retention.

