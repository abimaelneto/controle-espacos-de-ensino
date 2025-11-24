import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { ResolveStudentIdUseCase } from './resolve-student-id.use-case';

export interface ActiveAttendanceInfo {
  attendanceId: string;
  studentId: string;
  roomId: string;
  roomNumber?: string;
  checkInTime: Date;
}

export class GetActiveAttendanceByUserIdUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly resolveStudentIdUseCase: ResolveStudentIdUseCase,
  ) {}

  async execute(userId: string): Promise<ActiveAttendanceInfo | null> {
    // Resolver studentId a partir do userId
    const studentId = await this.resolveStudentIdUseCase.execute(
      'MATRICULA', // Método padrão, não será usado se userId for encontrado
      '', // Valor padrão, não será usado se userId for encontrado
      userId,
    );

    if (!studentId) {
      console.log(`[GetActiveAttendanceByUserId] Aluno não encontrado para userId: ${userId}`);
      return null;
    }

    console.log(`[GetActiveAttendanceByUserId] studentId resolvido: ${studentId} para userId: ${userId}`);

    // Buscar check-in ativo do aluno
    const activeAttendance = await this.attendanceRepository.findActiveByStudent(
      studentId,
    );

    if (!activeAttendance) {
      console.log(`[GetActiveAttendanceByUserId] Nenhum check-in ativo encontrado para studentId: ${studentId}`);
      return null;
    }

    // Verificar se o check-in é de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(activeAttendance.getCheckInTime());
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() !== today.getTime()) {
      console.log(`[GetActiveAttendanceByUserId] Check-in não é de hoje para studentId: ${studentId}`);
      return null; // Check-in não é de hoje, não é considerado ativo
    }

    return {
      attendanceId: activeAttendance.getId(),
      studentId: activeAttendance.getStudentId(),
      roomId: activeAttendance.getRoomId(),
      checkInTime: activeAttendance.getCheckInTime(),
    };
  }
}

