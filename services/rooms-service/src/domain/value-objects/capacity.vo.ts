export class Capacity {
  private readonly value: number;

  constructor(capacity: number) {
    this.validate(capacity);
    this.value = capacity;
  }

  private validate(capacity: number): void {
    if (capacity <= 0) {
      throw new Error('Capacidade deve ser maior que zero');
    }

    if (capacity > 10000) {
      throw new Error('Capacidade não pode ser maior que 10000');
    }
  }

  equals(other: Capacity): boolean {
    if (!(other instanceof Capacity)) {
      return false;
    }
    return this.value === other.value;
  }

  isGreaterThan(other: Capacity): boolean {
    return this.value > other.value;
  }

  getValue(): number {
    return this.value;
  }
}

