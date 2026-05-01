-- Remove the global unique index on compras.catalogo_id
-- Multiple compras can reference the same catalog item (e.g., different lists, retries after rejection)
DROP INDEX IF EXISTS "compras_catalogo_id_key";
