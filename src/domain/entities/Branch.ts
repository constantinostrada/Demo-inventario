/**
 * Branch Entity
 *
 * Represents one of the fixed physical locations where stock is kept.
 * The system initialises exactly three branches: CENTRO, NORTE and SUR.
 *
 * Layer: Domain → Entities
 */

import { BranchId } from '../value-objects/BranchId';
import { BranchCode } from '../value-objects/BranchCode';
import { DomainException } from '../exceptions/DomainException';

export interface BranchProps {
  id: BranchId;
  code: BranchCode;
  name: string;
  createdAt: Date;
}

export class Branch {
  private readonly props: BranchProps;

  private constructor(props: BranchProps) {
    this.props = Object.freeze({ ...props });
  }

  static create(props: BranchProps): Branch {
    if (!props.name || props.name.trim().length === 0) {
      throw new DomainException('Branch name cannot be empty.');
    }
    if (props.name.trim().length > 100) {
      throw new DomainException('Branch name cannot exceed 100 characters.');
    }
    return new Branch(props);
  }

  static reconstitute(props: BranchProps): Branch {
    return new Branch(props);
  }

  get id(): BranchId {
    return this.props.id;
  }

  get code(): BranchCode {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
