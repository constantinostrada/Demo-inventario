-- ─────────────────────────────────────────────────────────────────────────────
-- Demo Inventario — Database Initialisation Script
-- Runs automatically when the PostgreSQL container first starts.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Enables trigram full-text search

-- ─── Branches (closed set: CENTRO / NORTE / SUR) ──────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(20)   NOT NULL UNIQUE CHECK (code IN ('CENTRO', 'NORTE', 'SUR')),
  name        VARCHAR(100)  NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Seed the three fixed branches at initialisation time. The set is closed —
-- only CENTRO, NORTE and SUR ever exist.
INSERT INTO branches (id, code, name) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'CENTRO', 'Centro'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'NORTE',  'Norte'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'SUR',    'Sur')
ON CONFLICT (code) DO NOTHING;

-- ─── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                   UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 VARCHAR(200)  NOT NULL,
  description          TEXT          NOT NULL DEFAULT '',
  sku                  VARCHAR(50)   NOT NULL UNIQUE,
  price_amount_cents   INTEGER       NOT NULL CHECK (price_amount_cents >= 0),
  price_currency       VARCHAR(3)    NOT NULL DEFAULT 'USD',
  category             VARCHAR(50)   NOT NULL,
  stock_quantity       INTEGER       NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  minimum_stock_level  INTEGER       NOT NULL DEFAULT 0 CHECK (minimum_stock_level >= 0),
  is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku        ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_active  ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm  ON products USING gin (name gin_trgm_ops);

-- ─── Per-branch Stock ─────────────────────────────────────────────────────────
-- Identity is the (product_id, branch_id) pair: each product carries an
-- independent quantity at each branch.
CREATE TABLE IF NOT EXISTS stock (
  product_id   UUID         NOT NULL REFERENCES products (id)  ON DELETE CASCADE,
  branch_id    UUID         NOT NULL REFERENCES branches (id)  ON DELETE RESTRICT,
  quantity     INTEGER      NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_product_id  ON stock (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_branch_id   ON stock (branch_id);

-- ─── Stock Movements ──────────────────────────────────────────────────────────
-- Every IN, OUT or TRANSFER operation produces an immutable movement row.
-- Branch fields capture which branch(es) were involved:
--   IN        → destination_branch_id
--   OUT       → source_branch_id
--   TRANSFER  → both source_branch_id and destination_branch_id
CREATE TABLE IF NOT EXISTS stock_movements (
  id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id              UUID          NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  type                    VARCHAR(20)   NOT NULL CHECK (type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')),
  quantity                INTEGER       NOT NULL CHECK (quantity > 0),
  previous_stock          INTEGER       NOT NULL CHECK (previous_stock >= 0),
  new_stock               INTEGER       NOT NULL CHECK (new_stock >= 0),
  reason                  TEXT          NOT NULL,
  performed_by            VARCHAR(200)  NOT NULL,
  source_branch_id        UUID          REFERENCES branches (id) ON DELETE RESTRICT,
  destination_branch_id   UUID          REFERENCES branches (id) ON DELETE RESTRICT,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_transfer_has_both_branches CHECK (
    type <> 'TRANSFER'
    OR (source_branch_id IS NOT NULL
        AND destination_branch_id IS NOT NULL
        AND source_branch_id <> destination_branch_id)
  )
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id        ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at        ON stock_movements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_source_branch     ON stock_movements (source_branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_destination_branch ON stock_movements (destination_branch_id);

-- ─── Auto-update updated_at trigger ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_stock_updated_at ON stock;
CREATE TRIGGER trg_stock_updated_at
  BEFORE UPDATE ON stock
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
