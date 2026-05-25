# Docker Security Baseline

## Required

- Containers must run as non-root when an application image is introduced.
- Images must not use `latest`.
- Dockerfiles must not copy `.env` or secrets.
- Compose services must use named volumes and isolated networks.
- Databases and Redis should bind to localhost in development unless explicitly exposed.
- Production secrets must come from the runtime environment or a secret manager.

