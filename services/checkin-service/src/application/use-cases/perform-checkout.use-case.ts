import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { AttendanceCheckedOutEvent } from '../../domain/events/attendance-checked-out.event';
import { ResolveStudentIdUseCase } from './resolve-student-id.use-case';

export interface PerformCheckOutResult {
  success: boolean;
  message: string;
  attendanceId?: string;
}

export class PerformCheckOutUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly resolveStudentIdUseCase: ResolveStudentIdUseCase,
  ) {}

  async execute(
    identificationMethod: string,
    identificationValue: string,
    userId?: string,
  ): Promise<PerformCheckOutResult> {
    console.log(`[PerformCheckOut] Iniciando checkout - método: ${identificationMethod}, valor: ${identificationValue}, userId: ${userId}`);
    
    // Resolver studentId a partir do userId (se disponível) ou método de identificação
    let studentId: string | null = null;
    
    // Se tiver userId, tentar buscar por userId primeiro
    if (userId) {
      console.log(`[PerformCheckOut] Tentando resolver studentId por userId: ${userId}`);
      studentId = await this.resolveStudentIdUseCase.execute(
        identificationMethod || 'MATRICULA',
        identificationValue || '',
        userId,
      );
    }
    
    // Se ainda não tiver studentId, tentar por método de identificação
    if (!studentId && identificationMethod && identificationValue) {
      console.log(`[PerformCheckOut] Tentando resolver studentId por método de identificação: ${identificationMethod}`);
      studentId = await this.resolveStudentIdUseCase.execute(
        identificationMethod,
        identificationValue,
      );
    }

    if (!studentId) {
      console.log(`[PerformCheckOut] Aluno não encontrado`);
      return {
        success: false,
        message: 'Aluno não encontrado com os dados fornecidos',
      };
    }
    
    console.log(`[PerformCheckOut] studentId resolvido: ${studentId}`);

    // Buscar check-in ativo do aluno
    console.log(`[PerformCheckOut] Buscando check-in ativo para studentId: ${studentId}`);
    const activeAttendance = await this.attendanceRepository.findActiveByStudent(
      studentId,
    );

    if (!activeAttendance) {
      console.log(`[PerformCheckOut] Nenhum check-in ativo encontrado para studentId: ${studentId}`);
      return {
        success: false,
        message: 'Você não possui um check-in ativo',
      };
    }
    
    console.log(`[PerformCheckOut] Check-in ativo encontrado:`, {
      attendanceId: activeAttendance.getId(),
      roomId: activeAttendance.getRoomId(),
      checkInTime: activeAttendance.getCheckInTime(),
    });

    // Verificar se o check-in é de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(activeAttendance.getCheckInTime());
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() !== today.getTime()) {
      return {
        success: false,
        message: 'Check-in não é válido para checkout (não é de hoje)',
      };
    }

    // Remover o check-in (deletar do banco)
    // Como não há campo de checkout, vamos deletar o registro
    // Alternativamente, poderíamos adicionar um campo checkOutTime, mas por simplicidade vamos deletar
    await this.attendanceRepository.delete(activeAttendance.getId());

    // Publicar evento de checkout
    try {
      const event = new AttendanceCheckedOutEvent(activeAttendance);
      await this.eventPublisher.publish(event);
    } catch (error) {
      console.error('Failed to publish checkout event:', error);
      // Não falha o checkout se o evento não for publicado
    }

    return {
      success: true,
      message: 'Check-out realizado com sucesso',
      attendanceId: activeAttendance.getId(),
    };
  }
}

