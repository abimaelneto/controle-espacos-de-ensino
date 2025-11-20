import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PerformCheckInUseCase } from '../../../application/use-cases/perform-checkin.use-case';
import { GetAttendanceHistoryUseCase } from '../../../application/use-cases/get-attendance-history.use-case';
import { PerformCheckInDto } from '../../../application/dto/perform-checkin.dto';

@ApiTags('checkin')
@Controller('api/v1/checkin')
export class CheckInController {
  constructor(
    private readonly performCheckInUseCase: PerformCheckInUseCase,
    private readonly getAttendanceHistoryUseCase: GetAttendanceHistoryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Realizar check-in' })
  @ApiResponse({ status: 201, description: 'Check-in realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Regra de negócio violada' })
  async performCheckIn(@Body() dto: PerformCheckInDto) {
    const result = await this.performCheckInUseCase.execute(dto);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: result.message,
      checkInId: result.attendance?.getId(),
      timestamp: result.attendance?.getCheckInTime(),
      room: {
        id: dto.roomId,
      },
      student: {
        id: dto.studentId,
      },
    };
  }

  @Get('history/:studentId')
  @ApiOperation({ summary: 'Obter histórico de check-ins do aluno' })
  @ApiResponse({ status: 200, description: 'Histórico de check-ins' })
  async getHistory(@Param('studentId') studentId: string) {
    const history = await this.getAttendanceHistoryUseCase.execute(studentId);
    return history;
  }
}

