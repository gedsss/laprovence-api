# Deploy de homologacao

O ambiente de homologacao publica a API a partir da branch `develop`.

## Ambiente atual

- API: `/opt/laprovence/api`
- Branch publicada: `develop`
- Servico: `systemd` `laprovence-api`
- Porta local: `3668`
- URL publica: `https://laprovence.hom-oud.com.br/api`
- Ambiente: arquivo local `/opt/laprovence/api/.env`
- Banco e Redis: servicos `db` e `redis` do `docker-compose.yml`
- Recuperacao de senha por email: requer `RESEND_API_KEY` no `.env`

## Automacao

A VM executa um timer de `systemd` que consulta `origin/develop` e publica
quando houver commit novo:

- script: `/opt/laprovence/deploy-homologacao-api.sh`
- service: `laprovence-api-autodeploy.service`
- timer: `laprovence-api-autodeploy.timer`

O deploy faz:

1. `git fetch origin develop`
2. checkout/reset para `origin/develop`
3. `docker compose up -d db redis`
4. `npm ci --no-audit --no-fund`
5. `npm run prisma:generate`
6. `npm run prisma:migrate:deploy`
7. `npm run typecheck`
8. `systemctl restart laprovence-api`
9. health check em `http://127.0.0.1:3668/`

Como a homologacao nao possui SSH publico de entrada, o GitHub Actions apenas
valida a branch. O deploy automatico acontece dentro da propria VM.

## Instalacao do timer

Execute como `root` no servidor:

```bash
install -m 0755 scripts/deploy-homologacao-api.sh /opt/laprovence/deploy-homologacao-api.sh
install -m 0644 deploy/systemd/laprovence-api-autodeploy.service /etc/systemd/system/laprovence-api-autodeploy.service
install -m 0644 deploy/systemd/laprovence-api-autodeploy.timer /etc/systemd/system/laprovence-api-autodeploy.timer
systemctl daemon-reload
systemctl enable --now laprovence-api-autodeploy.timer
systemctl start laprovence-api-autodeploy.service
```

## Operacao

Status do timer:

```bash
systemctl list-timers laprovence-api-autodeploy.timer
systemctl status laprovence-api-autodeploy.service
```

Logs do ultimo deploy:

```bash
journalctl -u laprovence-api-autodeploy.service -n 100 --no-pager
```

Validacao publica:

```bash
curl -fsS https://laprovence.hom-oud.com.br/api/
```
