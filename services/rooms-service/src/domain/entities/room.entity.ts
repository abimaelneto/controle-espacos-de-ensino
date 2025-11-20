import { RoomNumber } from '../value-objects/room-number.vo';
import { Capacity } from '../value-objects/capacity.vo';
import { RoomType } from '../value-objects/room-type.vo';
import { randomUUID } from 'crypto';

export type RoomStatus = 'ACTIVE' | 'INACTIVE';

export class Room {
  private id: string;
  private roomNumber: RoomNumber;
  private capacity: Capacity;
  private type: RoomType;
  private description: string;
  private equipmentAvailable: boolean;
  private status: RoomStatus;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: string,
    roomNumber: RoomNumber,
    capacity: Capacity,
    type: RoomType,
    description: string,
    hasEquipment: boolean,
    status: RoomStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.roomNumber = roomNumber;
    this.capacity = capacity;
    this.type = type;
    this.description = description;
    this.equipmentAvailable = hasEquipment;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    roomNumber: RoomNumber,
    capacity: Capacity,
    type: RoomType,
    description: string,
    hasEquipment = false,
  ): Room {
    const now = new Date();
    return new Room(
      randomUUID(),
      roomNumber,
      capacity,
      type,
      description,
      hasEquipment,
      'ACTIVE',
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    roomNumber: RoomNumber,
    capacity: Capacity,
    type: RoomType,
    description: string,
    hasEquipment: boolean,
    status: RoomStatus,
    createdAt: Date,
    updatedAt: Date,
  ): Room {
    return new Room(
      id,
      roomNumber,
      capacity,
      type,
      description,
      hasEquipment,
      status,
      createdAt,
      updatedAt,
    );
  }

  activate(): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = 'INACTIVE';
    this.updatedAt = new Date();
  }

  updateCapacity(newCapacity: Capacity): void {
    this.capacity = newCapacity;
    this.updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  isAvailable(): boolean {
    return this.status === 'ACTIVE';
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getRoomNumber(): RoomNumber {
    return this.roomNumber;
  }

  getCapacity(): Capacity {
    return this.capacity;
  }

  getType(): RoomType {
    return this.type;
  }

  getDescription(): string {
    return this.description;
  }

  hasEquipment(): boolean {
    return this.equipmentAvailable;
  }

  getStatus(): RoomStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

