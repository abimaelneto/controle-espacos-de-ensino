import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetRoomUsageStatsUseCase } from '../../application/use-cases/get-room-usage-stats.use-case';
import { RoomUsageStatsDto } from '../../application/dto/room-usage-stats.dto';

@ApiTags('analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(
    private readonly getRoomUsageStatsUseCase: GetRoomUsageStatsUseCase,
  ) {}

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
}

