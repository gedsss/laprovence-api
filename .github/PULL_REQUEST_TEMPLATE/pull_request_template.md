# Pull Request Checklist

## Security

- [ ] No hardcoded secrets, tokens, passwords, or real credentials.
- [ ] Inputs are validated at API boundaries.
- [ ] Error responses do not expose stack traces or third-party payloads.
- [ ] Logs do not expose CPF, email, phone, tokens, cookies, or payment data.
- [ ] Authentication and authorization were reviewed for changed routes.

## LGPD

- [ ] New personal data fields have a clear purpose.
- [ ] Data minimization was considered.
- [ ] Retention or deletion impact was considered.
- [ ] Third-party data sharing was considered.

## Verification

- [ ] `npm run typecheck`
- [ ] `npm run security:audit`
- [ ] Relevant manual checkout/payment flow was tested when payment code changed.

