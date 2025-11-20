export class CPF {
  private readonly value: string;

  constructor(cpf: string) {
    this.validate(cpf);
    this.value = this.sanitize(cpf);
  }

  private sanitize(cpf: string): string {
    return cpf.replace(/[.\-]/g, '').trim();
  }

  private validate(cpf: string): void {
    if (!cpf || !cpf.trim()) {
      throw new Error('CPF não pode ser vazio');
    }

    const sanitized = this.sanitize(cpf);

    if (sanitized.length !== 11) {
      throw new Error('CPF inválido');
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(sanitized)) {
      throw new Error('CPF inválido');
    }

    // Validar dígitos verificadores
    if (!this.validateCheckDigits(sanitized)) {
      throw new Error('CPF inválido');
    }
  }

  private validateCheckDigits(cpf: string): boolean {
    let sum = 0;
    let remainder: number;

    // Validar primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  equals(other: CPF): boolean {
    if (!(other instanceof CPF)) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

