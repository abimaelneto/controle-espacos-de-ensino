export class RoomNumber {
  private readonly value: string;

  constructor(roomNumber: string) {
    this.validate(roomNumber);
    this.value = roomNumber.trim().toUpperCase();
  }

  private validate(roomNumber: string): void {
    if (!roomNumber || !roomNumber.trim()) {
      throw new Error('Número da sala não pode ser vazio');
    }

    const trimmed = roomNumber.trim();
    if (trimmed.length < 3) {
      throw new Error('Número da sala deve ter no mínimo 3 caracteres');
    }

    if (trimmed.length > 20) {
      throw new Error('Número da sala deve ter no máximo 20 caracteres');
    }
  }

  equals(other: RoomNumber): boolean {
    if (!(other instanceof RoomNumber)) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

