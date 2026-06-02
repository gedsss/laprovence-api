# Deploy de producao

O deploy automatico de producao da API roda a partir da branch `master`.

## URL

- API: `https://laprovencevie.com.br/api`
- Front: `https://laprovencevie.com.br/`

## GitHub Environment

Crie o environment `producao-api`.

Secrets obrigatorios:

- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY`

Secret opcional:

- `PROD_SSH_PORT` (padrao `22`)

Variables opcionais:

- `PROD_APP_DIR` (padrao `~/apps/laprovence-api-production`)
- `PROD_APP_NAME` (padrao `laprovence-api-production`)
- `PROD_API_PORT` (padrao `3668`)

## Arquivo de ambiente no servidor

No servidor, crie `~/apps/laprovence-api-production/.env.production` antes do
primeiro deploy. Exemplo:

```env
NODE_ENV="production"
PORT="3668"
HOST="127.0.0.1"
TRUST_PROXY="1"

DATABASE_URL="postgresql://usuario_prod:senha@localhost:5432/laprovence_prod"
REDIS_URL="redis://localhost:6379/0"
JWT_PASS="defina_um_segredo_de_producao_com_32_chars"

CORS_ORIGINS="https://laprovencevie.com.br,https://www.laprovencevie.com.br"
FRONTEND_URL="https://laprovencevie.com.br/"

PAGBANK_ENV="production"
PAGBANK_TOKEN="token_producao_pagbank"
PAGBANK_WEBHOOK_URL="https://laprovencevie.com.br/api/pagbank/webhook"
PAGBANK_WEBHOOK_SIGNATURE_REQUIRED="true"

RECAPTCHA_SECRET_KEY="secret_key_recaptcha_v3_producao"
RECAPTCHA_MIN_SCORE="0.5"
```

## Nginx

Exemplo de proxy:

```nginx
server {
  listen 443 ssl http2;
  server_name laprovencevie.com.br www.laprovencevie.com.br;

  location /api/ {
    proxy_pass http://127.0.0.1:3668/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Observacao

Nao use banco, Redis, PagBank sandbox ou URL de homologacao em producao.
