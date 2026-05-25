# LGPD Compliance Notes

## Personal Data Processed

The system may process names, email addresses, phone numbers, CPF, wedding/list metadata, purchase records, and payment status.

## Purpose

Data is collected to create and manage wedding gift lists, identify gift purchasers, process payments, support customer service, and provide operational auditability.

## Minimization

Only collect fields required for account creation, list management, purchase identification, payment provider requirements, and fraud prevention.

## Retention

Operational retention must be defined before production launch. Purchase and payment records should be retained only for legal, accounting, dispute, and support needs. Expired password reset tokens must be deleted or nulled after use.

## Data Subject Requests

The project must support a manual operational process for access, correction, export, and deletion requests. Deletion must consider legal retention requirements for payment and accounting records.

## Sharing

PagBank receives only the data necessary to process payments. Secrets and credentials must never be shared in issue comments, prompts, pull requests, logs, or screenshots.

## Technical Controls Applied

- Public browsing no longer exposes purchaser name, CPF, email, phone, or payment order identifiers.
- Payment operations after reservation require an ephemeral checkout token stored only as a hash by the API.
- Authenticated personal and purchase records are restricted to the record owner or the gestor role.
- Login state is carried by an `HttpOnly`, `SameSite=Strict` cookie rather than browser-readable token storage, with a CSRF header required for authenticated changes.
- Runtime logging redacts authentication/payment fields and avoids PagBank response contents.

## Pending Before Production

Define operational retention and LGPD data subject procedures, and publish the application only through HTTPS with restricted CORS and secure production cookie settings.

