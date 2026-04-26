-- CreateEnum
CREATE TYPE "Role" AS ENUM ('gestor', 'noivo');

-- CreateEnum
CREATE TYPE "Setor" AS ENUM ('Mesa_posta', 'Prataria', 'Adornos', 'Aromas', 'Mobiliario', 'Vasos', 'Complementos');

-- CreateEnum
CREATE TYPE "StatusCatalogo" AS ENUM ('Ativo', 'Inativo');

-- CreateEnum
CREATE TYPE "StatusLista" AS ENUM ('Ativa', 'Arquivada');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('Pendente', 'Aprovado', 'Rejeitado');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome_noiva" VARCHAR(50) NOT NULL,
    "nome_noivo" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(16) NOT NULL,
    "data_casamento" DATE NOT NULL,
    "password" TEXT NOT NULL,
    "reset_password_token" TEXT,
    "reset_password_expire" TIMESTAMP(3),
    "foto_casal" TEXT,
    "role" "Role" NOT NULL DEFAULT 'noivo',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "marca" TEXT,
    "tamanho" TEXT,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "setor" "Setor" NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "peso" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "status" "StatusCatalogo" NOT NULL DEFAULT 'Ativo',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "catalogo_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" CHAR(6) NOT NULL,
    "user_id" UUID NOT NULL,
    "nome_noivos" TEXT NOT NULL,
    "telefone" TEXT,
    "data_casamento" DATE,
    "foto_casal" TEXT,
    "mensagem_boas_vindas" TEXT,
    "status" "StatusLista" NOT NULL DEFAULT 'Ativa',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_itens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listas_id" UUID NOT NULL,
    "catalogo_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lista_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listas_id" UUID NOT NULL,
    "catalogo_id" UUID,
    "nome_convidado" TEXT NOT NULL,
    "cpf" CHAR(11) NOT NULL,
    "telefone" TEXT NOT NULL,
    "valor_pago" DECIMAL(10,2) NOT NULL,
    "forma_pagamento" TEXT NOT NULL,
    "status_pagamento" "StatusPagamento" NOT NULL DEFAULT 'Pendente',
    "is_new_gestor" BOOLEAN NOT NULL DEFAULT true,
    "is_new_noivo" BOOLEAN NOT NULL DEFAULT false,
    "data_compra" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premontadas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "badge" TEXT,
    "popular" BOOLEAN DEFAULT false,
    "img" TEXT,

    CONSTRAINT "premontadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premontada_itens" (
    "premontada_id" UUID NOT NULL,
    "catalogo_id" UUID NOT NULL,

    CONSTRAINT "premontada_itens_pkey" PRIMARY KEY ("premontada_id","catalogo_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_telefone_key" ON "user"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "user_reset_password_token_key" ON "user"("reset_password_token");

-- CreateIndex
CREATE UNIQUE INDEX "listas_codigo_key" ON "listas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "compras_catalogo_id_key" ON "compras"("catalogo_id");

-- AddForeignKey
ALTER TABLE "catalogo_images" ADD CONSTRAINT "catalogo_images_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas" ADD CONSTRAINT "listas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_itens" ADD CONSTRAINT "lista_itens_listas_id_fkey" FOREIGN KEY ("listas_id") REFERENCES "listas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_itens" ADD CONSTRAINT "lista_itens_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_listas_id_fkey" FOREIGN KEY ("listas_id") REFERENCES "listas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "catalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premontada_itens" ADD CONSTRAINT "premontada_itens_premontada_id_fkey" FOREIGN KEY ("premontada_id") REFERENCES "premontadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premontada_itens" ADD CONSTRAINT "premontada_itens_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
