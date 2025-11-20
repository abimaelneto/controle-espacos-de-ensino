export class Matricula {
  private readonly value: string;

  constructor(matricula: string) {
    this.validate(matricula);
    this.value = matricula.trim().toUpperCase();
  }

  private validate(matricula: string): void {
    if (!matricula || !matricula.trim()) {
      throw new Error('Matrícula não pode ser vazia');
    }

    const trimmed = matricula.trim();

    if (trimmed.length < 5) {
      throw new Error('Matrícula deve ter no mínimo 5 caracteres');
    }

    if (trimmed.length > 16) {
      throw new Error('Matrícula deve ter no máximo 16 caracteres');
    }
  }

  equals(other: Matricula): boolean {
    if (!(other instanceof Matricula)) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

