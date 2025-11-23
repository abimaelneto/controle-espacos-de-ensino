import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { ResolveStudentIdUseCase } from './resolve-student-id.use-case';

export interface ActiveAttendanceInfo {
  attendanceId: string;
  studentId: string;
  roomId: string;
  roomNumber?: string;
  checkInTime: Date;
}

export class GetActiveAttendanceByIdentificationUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly resolveStudentIdUseCase: ResolveStudentIdUseCase,
  ) {}

  async execute(
    identificationMethod: string,
    identificationValue: string,
  ): Promise<ActiveAttendanceInfo | null> {
    // Resolver studentId a partir do método de identificação
    const studentId = await this.resolveStudentIdUseCase.execute(
      identificationMethod,
      identificationValue,
    );

    if (!studentId) {
      return null;
    }

    // Buscar check-in ativo do aluno
    const activeAttendance = await this.attendanceRepository.findActiveByStudent(
      studentId,
    );

    if (!activeAttendance) {
      return null;
    }

    // Verificar se o check-in é de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(activeAttendance.getCheckInTime());
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() !== today.getTime()) {
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

