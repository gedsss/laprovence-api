CREATE TABLE "institucional_admin_user" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "institucional_admin_user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "institucional_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "institucional_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "institucional_stores" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "category_id" UUID,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "address" TEXT,
  "hours" TEXT,
  "phone" TEXT,
  "whatsapp" TEXT,
  "email" TEXT,
  "instagram" TEXT,
  "website" TEXT,
  "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "photo_labels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "highlighted" BOOLEAN NOT NULL DEFAULT false,
  "archived" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "institucional_stores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "institucional_admin_user_email_key" ON "institucional_admin_user"("email");
CREATE INDEX "institucional_categories_sort_order_idx" ON "institucional_categories"("sort_order");
CREATE INDEX "institucional_stores_category_id_idx" ON "institucional_stores"("category_id");
CREATE INDEX "institucional_stores_archived_idx" ON "institucional_stores"("archived");
CREATE INDEX "institucional_stores_highlighted_idx" ON "institucional_stores"("highlighted");
CREATE INDEX "institucional_stores_sort_order_idx" ON "institucional_stores"("sort_order");

ALTER TABLE "institucional_stores"
ADD CONSTRAINT "institucional_stores_category_id_fkey"
FOREIGN KEY ("category_id")
REFERENCES "institucional_categories"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
