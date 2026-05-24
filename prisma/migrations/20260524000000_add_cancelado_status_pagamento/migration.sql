ALTER TYPE "StatusPagamento" ADD VALUE IF NOT EXISTS 'Cancelado';

CREATE UNIQUE INDEX IF NOT EXISTS "compras_listas_catalogo_active_key"
ON "compras"("listas_id", "catalogo_id")
WHERE "catalogo_id" IS NOT NULL
  AND "status_pagamento" IN ('Pendente', 'Aprovado');
