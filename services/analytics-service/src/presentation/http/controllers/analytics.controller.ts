import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetRoomUsageStatsUseCase } from '../../../application/use-cases/get-room-usage-stats.use-case';
import { GetRoomUsageTimelineUseCase } from '../../../application/use-cases/get-room-usage-timeline.use-case';
import { GetStudentStatsUseCase } from '../../../application/use-cases/get-student-stats.use-case';
import { GetDashboardStatsUseCase } from '../../../application/use-cases/get-dashboard-stats.use-case';
import { GetRealtimeRoomOccupancyUseCase } from '../../../application/use-cases/get-realtime-room-occupancy.use-case';
import { RoomUsageStatsDto } from '../../../application/dto/room-usage-stats.dto';
import { DashboardStatsDto } from '../../../application/dto/dashboard-stats.dto';
import { StudentStatsDto } from '../../../application/dto/student-stats.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getRoomUsageStatsUseCase: GetRoomUsageStatsUseCase,
    private readonly getRoomUsageTimelineUseCase: GetRoomUsageTimelineUseCase,
    private readonly getStudentStatsUseCase: GetStudentStatsUseCase,
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getRealtimeRoomOccupancyUseCase: GetRealtimeRoomOccupancyUseCase,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatísticas gerais do dashboard' })
  @ApiResponse({ status: 200, description: 'Estatísticas do dashboard' })
  async getDashboardStats(@Query() query: DashboardStatsDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.getDashboardStatsUseCase.execute(startDate, endDate);
  }

  @Get('rooms/stats')
  @ApiOperation({ summary: 'Obter estatísticas de uso de uma sala (compatível com frontend)' })
  @ApiResponse({ status: 200, description: 'Estatísticas de uso' })
  async getRoomUsageStatsByQuery(@Query() query: RoomUsageStatsDto & { roomId: string }) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    return this.getRoomUsageStatsUseCase.execute(query.roomId, startDate, endDate);
  }

  @Get('rooms/:roomId/usage')
  @ApiOperation({ summary: 'Obter estatísticas de uso de uma sala' })
  @ApiResponse({ status: 200, description: 'Estatísticas de uso' })
  async getRoomUsageStats(
    @Param('roomId') roomId: string,
    @Query() query: RoomUsageStatsDto,
  ) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    return this.getRoomUsageStatsUseCase.execute(roomId, startDate, endDate);
  }

  @Get('rooms/:roomId/timeline')
  @ApiOperation({ summary: 'Obter timeline de uso de uma sala (com dados diários para gráficos)' })
  @ApiResponse({ status: 200, description: 'Timeline de uso' })
  async getRoomUsageTimeline(
    @Param('roomId') roomId: string,
    @Query() query: StudentStatsDto,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.getRoomUsageTimelineUseCase.execute(roomId, startDate, endDate);
  }

  @Get('students/:studentId/stats')
  @ApiOperation({ summary: 'Obter estatísticas de um aluno' })
  @ApiResponse({ status: 200, description: 'Estatísticas do aluno' })
  async getStudentStats(
    @Param('studentId') studentId: string,
    @Query() query: StudentStatsDto,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.getStudentStatsUseCase.execute(studentId, startDate, endDate);
  }

  @Get('rooms/realtime')
  @ApiOperation({ summary: 'Obter ocupação em tempo real de todas as salas' })
  @ApiResponse({ status: 200, description: 'Ocupação em tempo real' })
  async getRealtimeOccupancy(@Query('roomIds') roomIds?: string) {
    const roomIdsArray = roomIds ? roomIds.split(',') : undefined;
    return this.getRealtimeRoomOccupancyUseCase.execute(roomIdsArray);
  }
}

