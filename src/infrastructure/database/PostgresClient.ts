/**
 * PostgresClient
 *
 * Manages a pg connection pool and exposes a typed query helper.
 * All DB access in this project goes through this single client.
 *
 * Layer: Infrastructure → Database
 */

import { Pool, PoolClient, QueryResult } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  maxConnections?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class PostgresClient {
  private readonly pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      max: config.maxConnections ?? 10,
      idleTimeoutMillis: config.idleTimeoutMillis ?? 30_000,
      connectionTimeoutMillis: config.connectionTimeoutMillis ?? 5_000,
    });

    this.pool.on('error', (err) => {
      // Infrastructure-level error — log and let the process decide what to do
      console.error('[PostgresClient] Unexpected pool error:', err);
    });
  }

  /** Execute a single parameterized query. */
  async query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  /** Acquire a client for a manual transaction. */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Run a callback inside a transaction.
   * Commits on success, rolls back on any thrown error.
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /** Gracefully close all pool connections (used on server shutdown). */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /** Health check — returns true if the DB is reachable. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
