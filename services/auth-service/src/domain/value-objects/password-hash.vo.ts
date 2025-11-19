import * as bcrypt from 'bcrypt';

export class PasswordHash {
  private readonly value: string;

  private constructor(hash: string) {
    this.value = hash;
  }

  static async fromPlain(plainPassword: string): Promise<PasswordHash> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return new PasswordHash(hash);
  }

  static fromHash(hash: string): PasswordHash {
    return new PasswordHash(hash);
  }

  async verify(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.value);
  }

  toString(): string {
    return this.value;
  }
}

