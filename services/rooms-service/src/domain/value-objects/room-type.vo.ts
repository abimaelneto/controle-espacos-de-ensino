export type RoomTypeValue = 'CLASSROOM' | 'LABORATORY' | 'AUDITORIUM' | 'STUDY_ROOM';

export class RoomType {
  private readonly value: RoomTypeValue;

  constructor(type: string) {
    this.validate(type);
    this.value = type.toUpperCase() as RoomTypeValue;
  }

  private validate(type: string): void {
    const validTypes: RoomTypeValue[] = [
      'CLASSROOM',
      'LABORATORY',
      'AUDITORIUM',
      'STUDY_ROOM',
    ];

    if (!validTypes.includes(type.toUpperCase() as RoomTypeValue)) {
      throw new Error('Tipo de sala inválido');
    }
  }

  equals(other: RoomType): boolean {
    if (!(other instanceof RoomType)) {
      return false;
    }
    return this.value === other.value;
  }

  getValue(): RoomTypeValue {
    return this.value;
  }

  isClassroom(): boolean {
    return this.value === 'CLASSROOM';
  }

  isLaboratory(): boolean {
    return this.value === 'LABORATORY';
  }

  isAuditorium(): boolean {
    return this.value === 'AUDITORIUM';
  }

  isStudyRoom(): boolean {
    return this.value === 'STUDY_ROOM';
  }
}

