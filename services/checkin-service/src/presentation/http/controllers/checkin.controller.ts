import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { PerformCheckInUseCase } from '../../../application/use-cases/perform-checkin.use-case';
import { GetAttendanceHistoryUseCase } from '../../../application/use-cases/get-attendance-history.use-case';
import { GetActiveAttendanceByIdentificationUseCase } from '../../../application/use-cases/get-active-attendance-by-identification.use-case';
import { PerformCheckOutUseCase } from '../../../application/use-cases/perform-checkout.use-case';
import { PerformCheckInDto } from '../../../application/dto/perform-checkin.dto';
import { PerformCheckOutDto } from '../../../application/dto/checkout.dto';

@ApiTags('checkin')
@ApiBearerAuth()
@Controller('checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckInController {
  constructor(
    private readonly performCheckInUseCase: PerformCheckInUseCase,
    private readonly getAttendanceHistoryUseCase: GetAttendanceHistoryUseCase,
    private readonly getActiveAttendanceByIdentificationUseCase: GetActiveAttendanceByIdentificationUseCase,
    private readonly performCheckOutUseCase: PerformCheckOutUseCase,
  ) {}

  @Post()
  @Roles('ADMIN', 'STUDENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Realizar check-in' })
  @ApiResponse({ status: 201, description: 'Check-in realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Regra de negócio violada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
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
  @Roles('ADMIN', 'MONITOR', 'STUDENT')
  @ApiOperation({ summary: 'Obter histórico de check-ins do aluno' })
  @ApiResponse({ status: 200, description: 'Histórico de check-ins' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getHistory(@Param('studentId') studentId: string) {
    const history = await this.getAttendanceHistoryUseCase.execute(studentId);
    return history;
  }

  @Get('active')
  @Roles('ADMIN', 'MONITOR', 'STUDENT')
  @ApiOperation({ summary: 'Verificar check-in ativo por identificação' })
  @ApiResponse({ status: 200, description: 'Check-in ativo encontrado ou null' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getActiveAttendance(
    @Query('method') method: string,
    @Query('value') value: string,
  ) {
    const activeAttendance = await this.getActiveAttendanceByIdentificationUseCase.execute(
      method,
      value,
    );
    return activeAttendance;
  }

  @Post('checkout')
  @Roles('ADMIN', 'STUDENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar check-out' })
  @ApiResponse({ status: 200, description: 'Check-out realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Check-in ativo não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async performCheckOut(@Body() dto: PerformCheckOutDto) {
    const result = await this.performCheckOutUseCase.execute(
      dto.identificationMethod,
      dto.identificationValue,
    );

    return {
      success: result.success,
      message: result.message,
      attendanceId: result.attendanceId,
    };
  }
}

