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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CreateRoomUseCase } from '../../../application/use-cases/create-room.use-case';
import { GetRoomUseCase } from '../../../application/use-cases/get-room.use-case';
import { ListRoomsUseCase } from '../../../application/use-cases/list-rooms.use-case';
import { UpdateRoomUseCase } from '../../../application/use-cases/update-room.use-case';
import { DeleteRoomUseCase } from '../../../application/use-cases/delete-room.use-case';
import { CreateRoomDto } from '../../../application/dto/create-room.dto';
import { UpdateRoomDto } from '../../../application/dto/update-room.dto';
import { Room } from '../../../domain/entities/room.entity';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly getRoomUseCase: GetRoomUseCase,
    private readonly listRoomsUseCase: ListRoomsUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar nova sala' })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Número da sala já cadastrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
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
  @Roles('ADMIN', 'MONITOR', 'STUDENT')
  @ApiOperation({ summary: 'Listar todas as salas' })
  @ApiResponse({ status: 200, description: 'Lista de salas' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
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
  @Roles('ADMIN', 'MONITOR', 'STUDENT')
  @ApiOperation({ summary: 'Buscar sala por ID' })
  @ApiResponse({ status: 200, description: 'Sala encontrada' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
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
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar sala' })
  @ApiResponse({ status: 200, description: 'Sala atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
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
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar sala' })
  @ApiResponse({ status: 204, description: 'Sala desativada com sucesso' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteRoomUseCase.execute(id);
  }
}

