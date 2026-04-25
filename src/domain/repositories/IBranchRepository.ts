/**
 * IBranchRepository — Repository Interface
 *
 * Defines persistence operations for the three fixed branches.
 * The branch set is closed at DB initialisation time — repositories
 * only read branches, they do not create or delete them.
 *
 * Layer: Domain → Repositories
 */

import { Branch } from '../entities/Branch';
import { BranchId } from '../value-objects/BranchId';
import { BranchCode } from '../value-objects/BranchCode';

export interface IBranchRepository {
  /** Return all three branches, in a stable order. */
  findAll(): Promise<Branch[]>;

  /** Find a branch by its internal id. Returns null if not found. */
  findById(id: BranchId): Promise<Branch | null>;

  /** Find a branch by its business code (CENTRO / NORTE / SUR). */
  findByCode(code: BranchCode): Promise<Branch | null>;
}
