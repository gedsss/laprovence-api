# Deploy de homologacao

Este ambiente deve ser isolado de producao:

- branch: `developer`
- processo PM2: `laprovence-api-homolog`
- porta local sugerida: `3669`
- URL publica: `https://laprovence.hom-oud.com.br/api`
- banco: uma base PostgreSQL propria de homologacao
- Redis: uma instancia ou DB logico proprio de homologacao

## GitHub Environment

Crie o environment `homologacao-api` no repositorio da API.

Secrets obrigatorios:

- `HOMOLOG_SSH_HOST`
- `HOMOLOG_SSH_USER`
- `HOMOLOG_SSH_KEY`

Secret opcional:

- `HOMOLOG_SSH_PORT` (padrao `22`)

Variables opcionais:

- `HOMOLOG_APP_DIR` (padrao `~/apps/laprovence-api-homolog`)
- `HOMOLOG_APP_NAME` (padrao `laprovence-api-homolog`)
- `HOMOLOG_API_PORT` (padrao `3669`)

## Arquivo de ambiente no servidor

No servidor, crie `~/apps/laprovence-api-homolog/.env.homologacao` antes do
primeiro deploy. Exemplo:

```env
NODE_ENV="production"
PORT="3669"
HOST="127.0.0.1"
TRUST_PROXY="1"

DATABASE_URL="postgresql://usuario_homolog:senha@localhost:5432/laprovence_homolog"
REDIS_URL="redis://localhost:6379/1"
JWT_PASS="defina_um_segredo_de_homologacao_com_32_chars"

CORS_ORIGINS="https://laprovence.hom-oud.com.br"
FRONTEND_URL="https://laprovence.hom-oud.com.br/"

PAGBANK_ENV="sandbox"
PAGBANK_TOKEN="token_sandbox_pagbank"
PAGBANK_WEBHOOK_URL="https://laprovence.hom-oud.com.br/api/pagbank/webhook"
PAGBANK_WEBHOOK_SIGNATURE_REQUIRED="true"

# Opcional em homologacao se ja houver chave v3 configurada.
RECAPTCHA_SECRET_KEY=""
RECAPTCHA_MIN_SCORE="0.5"
```

## Nginx

Exemplo de proxy para servir a API de homologacao sem tocar na API de producao:

```nginx
server {
  listen 443 ssl http2;
  server_name laprovence.hom-oud.com.br;

  location /api/ {
    proxy_pass http://127.0.0.1:3669/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Depois de apontar o DNS e emitir o certificado TLS, valide:

```bash
curl https://laprovence.hom-oud.com.br/api
curl https://laprovence.hom-oud.com.br/api/catalogo
```
