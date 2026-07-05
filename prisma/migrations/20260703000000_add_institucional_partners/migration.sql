CREATE TABLE "institucional_partner_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "institucional_partner_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "institucional_partners" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "category_id" UUID,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "hours" TEXT,
  "phone" TEXT,
  "whatsapp" TEXT,
  "email" TEXT,
  "instagram" TEXT,
  "website" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "institucional_partners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "institucional_partner_categories_sort_order_idx" ON "institucional_partner_categories"("sort_order");
CREATE INDEX "institucional_partners_category_id_idx" ON "institucional_partners"("category_id");
CREATE INDEX "institucional_partners_sort_order_idx" ON "institucional_partners"("sort_order");

ALTER TABLE "institucional_partners"
ADD CONSTRAINT "institucional_partners_category_id_fkey"
FOREIGN KEY ("category_id")
REFERENCES "institucional_partner_categories"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
