-- ─────────────────────────────────────────────────────────────────────────────
-- Demo Inventario — Database Initialisation Script
-- Runs automatically when the PostgreSQL container first starts.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Enables trigram full-text search

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

-- ─── Product Branch Stocks ───────────────────────────────────────────────────
-- One row per (product, branch). A new product gets 3 rows (one per sucursal)
-- automatically inserted by the application layer at creation time.
CREATE TABLE IF NOT EXISTS product_branch_stocks (
  product_id   UUID         NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  branch_id    VARCHAR(50)  NOT NULL,
  quantity     INTEGER      NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  PRIMARY KEY (product_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_product_branch_stocks_branch  ON product_branch_stocks (branch_id);

-- ─── Stock Movements ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID          NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  type            VARCHAR(20)   NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity        INTEGER       NOT NULL CHECK (quantity > 0),
  previous_stock  INTEGER       NOT NULL CHECK (previous_stock >= 0),
  new_stock       INTEGER       NOT NULL CHECK (new_stock >= 0),
  reason          TEXT          NOT NULL,
  performed_by    VARCHAR(200)  NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id  ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at  ON stock_movements (created_at DESC);

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
