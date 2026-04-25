/**
 * PostgresBranchRepository
 *
 * Implements IBranchRepository using PostgreSQL.
 * The branch set is closed at DB initialisation time (CENTRO/NORTE/SUR),
 * so this repository is read-only.
 *
 * Layer: Infrastructure → Repositories
 */

import { Branch } from '../../domain/entities/Branch';
import { BranchId } from '../../domain/value-objects/BranchId';
import { BranchCode } from '../../domain/value-objects/BranchCode';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { PostgresClient } from '../database/PostgresClient';

interface BranchRow {
  id: string;
  code: string;
  name: string;
  created_at: Date;
}

export class PostgresBranchRepository implements IBranchRepository {
  constructor(private readonly db: PostgresClient) {}

  async findAll(): Promise<Branch[]> {
    const result = await this.db.query<BranchRow>(
      `SELECT id, code, name, created_at FROM branches ORDER BY code ASC`,
    );
    return result.rows.map((row) => this.rowToEntity(row));
  }

  async findById(id: BranchId): Promise<Branch | null> {
    const result = await this.db.query<BranchRow>(
      `SELECT id, code, name, created_at FROM branches WHERE id = $1`,
      [id.value],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.rowToEntity(result.rows[0]);
  }

  async findByCode(code: BranchCode): Promise<Branch | null> {
    const result = await this.db.query<BranchRow>(
      `SELECT id, code, name, created_at FROM branches WHERE code = $1`,
      [code.value],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.rowToEntity(result.rows[0]);
  }

  private rowToEntity(row: BranchRow): Branch {
    return Branch.reconstitute({
      id: new BranchId(row.id),
      code: new BranchCode(row.code),
      name: row.name,
      createdAt: new Date(row.created_at),
    });
  }
}
