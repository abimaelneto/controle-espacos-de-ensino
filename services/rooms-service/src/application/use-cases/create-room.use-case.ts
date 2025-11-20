import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { RoomValidationService } from '../../domain/services/room-validation.service';
import { Room } from '../../domain/entities/room.entity';
import { RoomNumber } from '../../domain/value-objects/room-number.vo';
import { Capacity } from '../../domain/value-objects/capacity.vo';
import { RoomType } from '../../domain/value-objects/room-type.vo';
import { CreateRoomDto } from '../dto/create-room.dto';
import { RoomCreatedEvent } from '../../domain/events/room-created.event';
import { BusinessMetricsService } from '../../infrastructure/metrics/business-metrics.service';

export class CreateRoomUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly validationService: RoomValidationService,
    private readonly metrics?: BusinessMetricsService,
  ) {}

  async execute(createRoomDto: CreateRoomDto): Promise<Room> {
    const roomNumber = new RoomNumber(createRoomDto.roomNumber);
    const capacity = new Capacity(createRoomDto.capacity);
    const type = new RoomType(createRoomDto.type);

    // Validar unicidade do número da sala
    const isRoomNumberUnique =
      await this.validationService.validateRoomNumberUniqueness(roomNumber);
    if (!isRoomNumberUnique) {
      throw new Error('Número da sala já cadastrado');
    }

    const room = Room.create(
      roomNumber,
      capacity,
      type,
      createRoomDto.description || '',
      createRoomDto.hasEquipment || false,
    );

    await this.roomRepository.save(room);

    const event = new RoomCreatedEvent(room);
    await this.eventPublisher.publish(event);

    // Metrics
    this.metrics?.incrementRoomsCreated(room.getType().toString());

    return room;
  }
}

