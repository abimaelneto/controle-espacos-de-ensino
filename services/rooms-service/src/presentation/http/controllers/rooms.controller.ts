import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateRoomUseCase } from '../../../application/use-cases/create-room.use-case';
import { GetRoomUseCase } from '../../../application/use-cases/get-room.use-case';
import { ListRoomsUseCase } from '../../../application/use-cases/list-rooms.use-case';
import { UpdateRoomUseCase } from '../../../application/use-cases/update-room.use-case';
import { DeleteRoomUseCase } from '../../../application/use-cases/delete-room.use-case';
import { CreateRoomDto } from '../../../application/dto/create-room.dto';
import { UpdateRoomDto } from '../../../application/dto/update-room.dto';
import { Room } from '../../../domain/entities/room.entity';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly getRoomUseCase: GetRoomUseCase,
    private readonly listRoomsUseCase: ListRoomsUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova sala' })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Número da sala já cadastrado' })
  async create(@Body() createRoomDto: CreateRoomDto) {
    const room = await this.createRoomUseCase.execute(createRoomDto);
    return {
      id: room.getId(),
      roomNumber: room.getRoomNumber().toString(),
      capacity: room.getCapacity().getValue(),
      type: room.getType().getValue(),
      description: room.getDescription(),
      hasEquipment: room.hasEquipment(),
      status: room.getStatus(),
      createdAt: room.getCreatedAt(),
      updatedAt: room.getUpdatedAt(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as salas' })
  @ApiResponse({ status: 200, description: 'Lista de salas' })
  async findAll() {
    const rooms = await this.listRoomsUseCase.execute();
    return rooms.map((room) => ({
      id: room.getId(),
      roomNumber: room.getRoomNumber().toString(),
      capacity: room.getCapacity().getValue(),
      type: room.getType().getValue(),
      description: room.getDescription(),
      hasEquipment: room.hasEquipment(),
      status: room.getStatus(),
      createdAt: room.getCreatedAt(),
      updatedAt: room.getUpdatedAt(),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar sala por ID' })
  @ApiResponse({ status: 200, description: 'Sala encontrada' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  async findOne(@Param('id') id: string) {
    const room = await this.getRoomUseCase.execute(id);
    if (!room) {
      return null;
    }
    return {
      id: room.getId(),
      roomNumber: room.getRoomNumber().toString(),
      capacity: room.getCapacity().getValue(),
      type: room.getType().getValue(),
      description: room.getDescription(),
      hasEquipment: room.hasEquipment(),
      status: room.getStatus(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar sala' })
  @ApiResponse({ status: 200, description: 'Sala atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    const room = await this.updateRoomUseCase.execute(id, updateRoomDto);
    return {
      id: room.getId(),
      roomNumber: room.getRoomNumber().toString(),
      capacity: room.getCapacity().getValue(),
      type: room.getType().getValue(),
      description: room.getDescription(),
      hasEquipment: room.hasEquipment(),
      status: room.getStatus(),
      createdAt: room.getCreatedAt(),
      updatedAt: room.getUpdatedAt(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar sala' })
  @ApiResponse({ status: 204, description: 'Sala desativada com sucesso' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteRoomUseCase.execute(id);
  }
}

