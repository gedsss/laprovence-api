# Kubernetes Security Policy

This project is currently deployed on VPS/PM2/Nginx, so Kubernetes files are reference-only until a cluster deployment exists.

When Kubernetes is introduced, manifests must include:

- RBAC.
- NetworkPolicy.
- Resource requests and limits.
- Liveness and readiness probes.
- `runAsNonRoot`.
- `readOnlyRootFilesystem` where practical.
- External Secrets, Vault, or Sealed Secrets for credentials.

