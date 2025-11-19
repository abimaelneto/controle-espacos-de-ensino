export type RoleType = 'ADMIN' | 'STUDENT' | 'MONITOR';

export class Role {
  private readonly value: RoleType;

  constructor(role: string) {
    this.validate(role);
    this.value = role as RoleType;
  }

  private validate(role: string): void {
    const validRoles: RoleType[] = ['ADMIN', 'STUDENT', 'MONITOR'];
    if (!validRoles.includes(role as RoleType)) {
      throw new Error(`Invalid role: ${role}`);
    }
  }

  isAdmin(): boolean {
    return this.value === 'ADMIN';
  }

  isStudent(): boolean {
    return this.value === 'STUDENT';
  }

  isMonitor(): boolean {
    return this.value === 'MONITOR';
  }

  getValue(): RoleType {
    return this.value;
  }

  equals(other: Role): boolean {
    if (!(other instanceof Role)) {
      return false;
    }
    return this.value === other.value;
  }
}

