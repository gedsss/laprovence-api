-- AlterTable
ALTER TABLE "compras" ADD COLUMN     "email" TEXT,
ADD COLUMN     "pagbank_order_id" TEXT;

-- CreateIndex
CREATE INDEX "catalogo_setor_idx" ON "catalogo"("setor");

-- CreateIndex
CREATE INDEX "catalogo_status_idx" ON "catalogo"("status");

-- CreateIndex
CREATE INDEX "catalogo_setor_status_idx" ON "catalogo"("setor", "status");

-- CreateIndex
CREATE INDEX "catalogo_images_catalogo_id_idx" ON "catalogo_images"("catalogo_id");

-- CreateIndex
CREATE INDEX "compras_listas_id_idx" ON "compras"("listas_id");

-- CreateIndex
CREATE INDEX "compras_cpf_idx" ON "compras"("cpf");

-- CreateIndex
CREATE INDEX "compras_status_pagamento_idx" ON "compras"("status_pagamento");

-- CreateIndex
CREATE INDEX "lista_itens_listas_id_idx" ON "lista_itens"("listas_id");

-- CreateIndex
CREATE INDEX "lista_itens_catalogo_id_idx" ON "lista_itens"("catalogo_id");

-- CreateIndex
CREATE INDEX "listas_user_id_idx" ON "listas"("user_id");
