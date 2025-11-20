import { IAttendanceRepository } from '../ports/repositories/attendance.repository.port';
import { IStudentsClient, StudentInfo } from '../ports/http/students-client.port';
import { IRoomsClient, RoomInfo } from '../ports/http/rooms-client.port';

export interface CheckInValidationResult {
  valid: boolean;
  reason?: string;
  student?: StudentInfo;
  room?: RoomInfo;
}

export class CheckInValidationService {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly studentsClient: IStudentsClient,
    private readonly roomsClient: IRoomsClient,
  ) {}

  async validateCheckIn(
    studentId: string,
    roomId: string,
  ): Promise<CheckInValidationResult> {
    // 1. Validar se aluno existe e está ativo
    const isActive = await this.studentsClient.validateStudentActive(studentId);
    if (!isActive) {
      return {
        valid: false,
        reason: 'Aluno não encontrado ou inativo',
      };
    }

    // 2. Validar se sala existe e está disponível
    const room = await this.roomsClient.getRoom(roomId);
    if (!room) {
      return {
        valid: false,
        reason: 'Sala não encontrada',
      };
    }

    if (room.status !== 'ACTIVE') {
      return {
        valid: false,
        reason: 'Sala não está disponível',
      };
    }

    // 3. Validar se aluno já tem check-in hoje (evitar múltiplos check-ins no mesmo dia)
    const activeAttendance =
      await this.attendanceRepository.findActiveByStudent(studentId);
    if (activeAttendance) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(activeAttendance.getCheckInTime());
      checkInDate.setHours(0, 0, 0, 0);

      // Se já fez check-in hoje, não permitir novo check-in
      if (checkInDate.getTime() === today.getTime()) {
        return {
          valid: false,
          reason: `Aluno já possui um check-in registrado hoje na sala ${activeAttendance.getRoomId()}`,
        };
      }
    }

    // 4. Validar capacidade da sala
    const currentOccupancy =
      await this.attendanceRepository.countActiveByRoom(roomId);
    if (currentOccupancy >= room.capacity) {
      return {
        valid: false,
        reason: `Sala atingiu a capacidade máxima de ${room.capacity} alunos`,
      };
    }

    return {
      valid: true,
      room,
    };
  }
}
