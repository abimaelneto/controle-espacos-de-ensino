import { Email } from '../value-objects/email.vo';
import { Role } from '../value-objects/role.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { randomUUID } from 'crypto';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export class User {
  private id: string;
  private email: Email;
  private passwordHash: PasswordHash;
  private role: Role;
  private status: UserStatus;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: string,
    email: Email,
    passwordHash: PasswordHash,
    role: Role,
    status: UserStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    email: Email,
    passwordHash: PasswordHash,
    role: Role,
  ): User {
    const now = new Date();
    return new User(
      randomUUID(),
      email,
      passwordHash,
      role,
      'ACTIVE',
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    email: Email,
    passwordHash: PasswordHash,
    role: Role,
    status: UserStatus,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(id, email, passwordHash, role, status, createdAt, updatedAt);
  }

  async authenticate(plainPassword: string): Promise<boolean> {
    return this.passwordHash.verify(plainPassword);
  }

  async changePassword(
    oldPlainPassword: string,
    newPasswordHash: PasswordHash,
  ): Promise<void> {
    const isOldPasswordValid = await this.passwordHash.verify(
      oldPlainPassword,
    );
    if (!isOldPasswordValid) {
      throw new Error('Old password is incorrect');
    }

    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = 'INACTIVE';
    this.updatedAt = new Date();
  }

  hasPermission(permission: string): boolean {
    // Admin tem todas as permissões
    if (this.role.isAdmin()) {
      return true;
    }

    // Permissões específicas por role
    const rolePermissions: Record<string, string[]> = {
      STUDENT: ['REGISTER_ATTENDANCE', 'VIEW_OWN_HISTORY'],
      MONITOR: ['VIEW_OCCUPANCY', 'VIEW_REPORTS'],
    };

    const permissions = rolePermissions[this.role.getValue()] || [];
    return permissions.includes(permission);
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getRole(): Role {
    return this.role;
  }

  getStatus(): UserStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

