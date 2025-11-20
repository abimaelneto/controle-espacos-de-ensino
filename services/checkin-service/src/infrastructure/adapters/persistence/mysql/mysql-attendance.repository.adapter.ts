import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { IAttendanceRepository } from '../../../../domain/ports/repositories/attendance.repository.port';
import { Attendance } from '../../../../domain/entities/attendance.entity';
import { AttendanceEntity } from './attendance.entity';

@Injectable()
export class MySQLAttendanceRepositoryAdapter
  implements IAttendanceRepository
{
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly repository: Repository<AttendanceEntity>,
  ) {}

  async findById(id: string): Promise<Attendance | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findActiveByStudent(studentId: string): Promise<Attendance | null> {
    // Buscar check-in mais recente do aluno
    // Como não há mais check-out, todos os check-ins são considerados "ativos" até serem substituídos
    const entity = await this.repository.findOne({
      where: { studentId },
      order: { checkInTime: 'DESC' },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findActiveByRoom(roomId: string): Promise<Attendance[]> {
    // Buscar todos os check-ins da sala
    // Como não há check-out, consideramos todos os check-ins do dia como "ativos"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entities = await this.repository.find({
      where: {
        roomId,
        checkInTime: Between(today, tomorrow),
      },
      order: { checkInTime: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByStudent(studentId: string, limit = 50): Promise<Attendance[]> {
    const entities = await this.repository.find({
      where: { studentId },
      order: { checkInTime: 'DESC' },
      take: limit,
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByRoom(
    roomId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Attendance[]> {
    const query = this.repository
      .createQueryBuilder('attendance')
      .where('attendance.roomId = :roomId', { roomId });

    if (startDate) {
      query.andWhere('attendance.checkInTime >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('attendance.checkInTime <= :endDate', { endDate });
    }

    query.orderBy('attendance.checkInTime', 'DESC');

    const entities = await query.getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async countActiveByRoom(roomId: string): Promise<number> {
    // Contar check-ins do dia na sala
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.repository.count({
      where: {
        roomId,
        checkInTime: Between(today, tomorrow),
      },
    });
  }

  async countByRoomAndDate(roomId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.repository.count({
      where: {
        roomId,
        checkInTime: Between(startOfDay, endOfDay),
      },
    });
  }

  async save(attendance: Attendance): Promise<void> {
    const entity = this.repository.create({
      id: attendance.getId(),
      studentId: attendance.getStudentId(),
      roomId: attendance.getRoomId(),
      checkInTime: attendance.getCheckInTime(),
      createdAt: attendance.getCreatedAt(),
      updatedAt: attendance.getUpdatedAt(),
    });

    await this.repository.save(entity);
  }

  private toDomain(entity: AttendanceEntity): Attendance {
    return Attendance.reconstitute(
      entity.id,
      entity.studentId,
      entity.roomId,
      entity.checkInTime,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}

