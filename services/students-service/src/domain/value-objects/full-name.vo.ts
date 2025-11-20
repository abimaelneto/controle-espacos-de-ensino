export class FullName {
  private readonly firstName: string;
  private readonly lastName: string;

  constructor(firstName: string, lastName: string) {
    this.validate(firstName, lastName);
    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
  }

  private validate(firstName: string, lastName: string): void {
    if (!firstName || !firstName.trim()) {
      throw new Error('Nome não pode ser vazio');
    }

    if (!lastName || !lastName.trim()) {
      throw new Error('Sobrenome não pode ser vazio');
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (trimmedFirstName.length < 3) {
      throw new Error('Nome deve ter no mínimo 3 caracteres');
    }

    if (trimmedFirstName.length > 50) {
      throw new Error('Nome deve ter no máximo 50 caracteres');
    }

    if (trimmedLastName.length < 3) {
      throw new Error('Sobrenome deve ter no mínimo 3 caracteres');
    }

    if (trimmedLastName.length > 50) {
      throw new Error('Sobrenome deve ter no máximo 50 caracteres');
    }
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  equals(other: FullName): boolean {
    if (!(other instanceof FullName)) {
      return false;
    }
    return (
      this.firstName === other.firstName && this.lastName === other.lastName
    );
  }
}

