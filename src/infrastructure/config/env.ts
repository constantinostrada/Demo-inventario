/**
 * Environment Configuration
 *
 * Single source of truth for all environment variables.
 * Validates required variables at startup — fail fast rather than
 * discovering missing config at runtime.
 *
 * Layer: Infrastructure → Config
 */

import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable "${key}" is not set.`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function optionalIntEnv(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (!raw) {
    return defaultValue;
  }
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable "${key}" must be an integer. Got: "${raw}"`);
  }
  return parsed;
}

export const env = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  isProduction: optionalEnv('NODE_ENV', 'development') === 'production',
  isDevelopment: optionalEnv('NODE_ENV', 'development') === 'development',

  server: {
    port: optionalIntEnv('PORT', 3000),
    corsOrigin: optionalEnv('CORS_ORIGIN', 'http://localhost:3001'),
  },

  database: {
    host: optionalEnv('DB_HOST', 'localhost'),
    port: optionalIntEnv('DB_PORT', 5432),
    user: optionalEnv('DB_USER', 'inventario'),
    password: optionalEnv('DB_PASSWORD', 'inventario_secret'),
    name: optionalEnv('DB_NAME', 'demo_inventario'),
    maxConnections: optionalIntEnv('DB_MAX_CONNECTIONS', 10),
  },
} as const;

// Validate required vars in production
if (env.isProduction) {
  requireEnv('DB_PASSWORD');
  requireEnv('CORS_ORIGIN');
}
