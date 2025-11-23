import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { CreateRoomUseCase } from '../../../application/use-cases/create-room.use-case';
import { GetRoomUseCase } from '../../../application/use-cases/get-room.use-case';
import { ListRoomsUseCase } from '../../../application/use-cases/list-rooms.use-case';
import { UpdateRoomUseCase } from '../../../application/use-cases/update-room.use-case';
import { DeleteRoomUseCase } from '../../../application/use-cases/delete-room.use-case';
import { Room } from '../../../domain/entities/room.entity';
import { RoomNumber } from '../../../domain/value-objects/room-number.vo';
import { Capacity } from '../../../domain/value-objects/capacity.vo';
import { RoomType } from '../../../domain/value-objects/room-type.vo';
import { CreateRoomDto } from '../../../application/dto/create-room.dto';
import { UpdateRoomDto } from '../../../application/dto/update-room.dto';

describe('RoomsController', () => {
  let controller: RoomsController;
  let createRoomUseCase: jest.Mocked<CreateRoomUseCase>;
  let getRoomUseCase: jest.Mocked<GetRoomUseCase>;
  let listRoomsUseCase: jest.Mocked<ListRoomsUseCase>;
  let updateRoomUseCase: jest.Mocked<UpdateRoomUseCase>;
  let deleteRoomUseCase: jest.Mocked<DeleteRoomUseCase>;
  let room: Room;

  beforeEach(async () => {
    const roomNumber = new RoomNumber('A101');
    const capacity = new Capacity(30);
    const type = new RoomType('CLASSROOM');
    room = Room.create(roomNumber, capacity, type, 'Sala de aula');

    createRoomUseCase = {
      execute: jest.fn(),
    } as any;

    getRoomUseCase = {
      execute: jest.fn(),
    } as any;

    listRoomsUseCase = {
      execute: jest.fn(),
    } as any;

    updateRoomUseCase = {
      execute: jest.fn(),
    } as any;

    deleteRoomUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: CreateRoomUseCase,
          useValue: createRoomUseCase,
        },
        {
          provide: GetRoomUseCase,
          useValue: getRoomUseCase,
        },
        {
          provide: ListRoomsUseCase,
          useValue: listRoomsUseCase,
        },
        {
          provide: UpdateRoomUseCase,
          useValue: updateRoomUseCase,
        },
        {
          provide: DeleteRoomUseCase,
          useValue: deleteRoomUseCase,
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
  });

  describe('create', () => {
    it('should create a room', async () => {
      const createDto: CreateRoomDto = {
        roomNumber: 'A101',
        capacity: 30,
        type: 'CLASSROOM',
        description: 'Sala de aula',
      };

      createRoomUseCase.execute.mockResolvedValue(room);

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(createRoomUseCase.execute).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findOne', () => {
    it('should return a room', async () => {
      getRoomUseCase.execute.mockResolvedValue(room);

      const result = await controller.findOne(room.getId());

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        id: room.getId(),
        roomNumber: 'A101',
        capacity: 30,
        type: 'CLASSROOM',
      });
      expect(getRoomUseCase.execute).toHaveBeenCalledWith(room.getId());
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      listRoomsUseCase.execute.mockResolvedValue([room]);

      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        id: room.getId(),
        roomNumber: 'A101',
        capacity: 30,
        type: 'CLASSROOM',
      });
      expect(listRoomsUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a room', async () => {
      const updateDto: UpdateRoomDto = {
        capacity: 50,
      };

      const updatedRoom = Room.create(
        new RoomNumber('A101'),
        new Capacity(50),
        new RoomType('CLASSROOM'),
        'Sala atualizada',
      );

      updateRoomUseCase.execute.mockResolvedValue(updatedRoom);

      const result = await controller.update(room.getId(), updateDto);

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        id: updatedRoom.getId(),
        roomNumber: 'A101',
        capacity: 50,
        type: 'CLASSROOM',
      });
      expect(updateRoomUseCase.execute).toHaveBeenCalledWith(
        room.getId(),
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a room', async () => {
      deleteRoomUseCase.execute.mockResolvedValue(undefined);

      await controller.remove(room.getId());

      expect(deleteRoomUseCase.execute).toHaveBeenCalledWith(room.getId());
    });
  });
});

