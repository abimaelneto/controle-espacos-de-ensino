import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoomRepository } from '../../../../domain/ports/repositories/room.repository.port';
import { Room } from '../../../../domain/entities/room.entity';
import { RoomNumber } from '../../../../domain/value-objects/room-number.vo';
import { RoomType } from '../../../../domain/value-objects/room-type.vo';
import { RoomEntity } from './room.entity';
import { RoomMapper } from './room.mapper';

@Injectable()
export class MySQLRoomRepositoryAdapter implements IRoomRepository {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly repository: Repository<RoomEntity>,
  ) {}

  async findById(id: string): Promise<Room | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? RoomMapper.toDomain(entity) : null;
  }

  async findByRoomNumber(roomNumber: RoomNumber): Promise<Room | null> {
    const entity = await this.repository.findOne({
      where: { roomNumber: roomNumber.toString() },
    });
    return entity ? RoomMapper.toDomain(entity) : null;
  }

  async findByType(type: RoomType): Promise<Room[]> {
    const entities = await this.repository.find({
      where: { type: type.getValue() },
    });
    return entities.map((entity) => RoomMapper.toDomain(entity));
  }

  async findAll(includeInactive = false): Promise<Room[]> {
    const where: any = {};
    if (!includeInactive) {
      where.status = 'ACTIVE';
    }

    const entities = await this.repository.find({ where });
    return entities.map((entity) => RoomMapper.toDomain(entity));
  }

  async findAvailable(): Promise<Room[]> {
    const entities = await this.repository.find({
      where: { status: 'ACTIVE' },
    });
    return entities.map((entity) => RoomMapper.toDomain(entity));
  }

  async save(room: Room): Promise<void> {
    const existingEntity = await this.repository.findOne({
      where: { id: room.getId() },
    });

    if (existingEntity) {
      // Update
      const persistenceData = RoomMapper.toPersistence(room);
      Object.assign(existingEntity, persistenceData);
      await this.repository.save(existingEntity);
    } else {
      // Create
      const entity = this.repository.create({
        id: room.getId(),
        ...RoomMapper.toPersistence(room),
        createdAt: room.getCreatedAt(),
        updatedAt: room.getUpdatedAt(),
      });
      await this.repository.save(entity);
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByRoomNumber(roomNumber: RoomNumber): Promise<boolean> {
    const entity = await this.repository.findOne({
      where: { roomNumber: roomNumber.toString() },
    });
    return entity !== null;
  }
}

