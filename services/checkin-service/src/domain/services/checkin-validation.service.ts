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

    // 3. Validar se aluno já tem check-in hoje em OUTRA sala
    // Se estiver na mesma sala, permitir (pode ser um novo check-in do mesmo dia)
    const activeAttendance =
      await this.attendanceRepository.findActiveByStudent(studentId);
    if (activeAttendance) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(activeAttendance.getCheckInTime());
      checkInDate.setHours(0, 0, 0, 0);

      // Se já fez check-in hoje em OUTRA sala, não permitir novo check-in
      if (checkInDate.getTime() === today.getTime() && activeAttendance.getRoomId() !== roomId) {
        return {
          valid: false,
          reason: `Você já possui um check-in ativo em outra sala. Faça checkout primeiro para fazer check-in nesta sala.`,
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
