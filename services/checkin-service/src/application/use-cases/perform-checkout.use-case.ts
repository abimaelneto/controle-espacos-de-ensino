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
  ): Promise<PerformCheckOutResult> {
    // Resolver studentId a partir do método de identificação
    const studentId = await this.resolveStudentIdUseCase.execute(
      identificationMethod,
      identificationValue,
    );

    if (!studentId) {
      return {
        success: false,
        message: 'Aluno não encontrado com os dados fornecidos',
      };
    }

    // Buscar check-in ativo do aluno
    const activeAttendance = await this.attendanceRepository.findActiveByStudent(
      studentId,
    );

    if (!activeAttendance) {
      return {
        success: false,
        message: 'Você não possui um check-in ativo',
      };
    }

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

