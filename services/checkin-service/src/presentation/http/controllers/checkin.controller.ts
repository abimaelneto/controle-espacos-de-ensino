import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { PerformCheckInUseCase } from '../../../application/use-cases/perform-checkin.use-case';
import { GetAttendanceHistoryUseCase } from '../../../application/use-cases/get-attendance-history.use-case';
import { GetActiveAttendanceByIdentificationUseCase } from '../../../application/use-cases/get-active-attendance-by-identification.use-case';
import { GetActiveAttendanceByUserIdUseCase } from '../../../application/use-cases/get-active-attendance-by-user-id.use-case';
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
    private readonly getActiveAttendanceByUserIdUseCase: GetActiveAttendanceByUserIdUseCase,
    private readonly performCheckOutUseCase: PerformCheckOutUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
  async performCheckIn(@Body() dto: PerformCheckInDto, @Req() request: Request) {
    console.log('[CheckInController] DTO recebido:', JSON.stringify(dto));
    
    // Extrair userId do token JWT (já validado pelo guard)
    const userId = (request as any).user?.sub;
    if (userId) {
      console.log('[CheckInController] userId extraído do token:', userId);
      // Se não tiver studentId no DTO mas tiver userId, adicionar ao DTO para o use case usar
      if (!dto.studentId) {
        dto.userId = userId;
      }
    }
    
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
        id: result.attendance?.getStudentId() || dto.studentId,
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

  @Get('active/me')
  @Roles('ADMIN', 'MONITOR', 'STUDENT')
  @ApiOperation({ summary: 'Verificar check-in ativo do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Check-in ativo encontrado ou null' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getMyActiveAttendance(@Req() request: Request) {
    const userId = (request as any).user?.sub;
    if (!userId) {
      return null;
    }
    const activeAttendance = await this.getActiveAttendanceByUserIdUseCase.execute(userId);
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
  async performCheckOut(@Body() dto: PerformCheckOutDto, @Req() request: Request) {
    console.log('[CheckInController] Checkout DTO recebido:', JSON.stringify(dto));
    
    // Extrair userId do token JWT (já validado pelo guard)
    const userId = (request as any).user?.sub;
    console.log('[CheckInController] userId extraído do token para checkout:', userId);
    
    const result = await this.performCheckOutUseCase.execute(
      dto.identificationMethod,
      dto.identificationValue,
      userId, // Passar userId para o use case
    );

    return {
      success: result.success,
      message: result.message,
      attendanceId: result.attendanceId,
    };
  }
}

