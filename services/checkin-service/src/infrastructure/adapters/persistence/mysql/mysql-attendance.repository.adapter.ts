import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<Attendance | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findActiveByStudent(studentId: string): Promise<Attendance | null> {
    // Buscar check-in mais recente do aluno de hoje
    // Check-ins são considerados "ativos" apenas se forem do dia atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`[MySQLAttendanceRepository] Buscando check-in ativo para studentId: ${studentId}`, {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
    });

    const entity = await this.repository.findOne({
      where: {
        studentId,
        checkInTime: Between(today, tomorrow),
      },
      order: { checkInTime: 'DESC' },
    });

    if (entity) {
      console.log(`[MySQLAttendanceRepository] Check-in ativo encontrado:`, {
        id: entity.id,
        studentId: entity.studentId,
        roomId: entity.roomId,
        checkInTime: entity.checkInTime,
      });
    } else {
      console.log(`[MySQLAttendanceRepository] Nenhum check-in ativo encontrado para studentId: ${studentId}`);
    }

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
      idempotencyKey: attendance.getIdempotencyKey(),
      createdAt: attendance.getCreatedAt(),
      updatedAt: attendance.getUpdatedAt(),
    });

    await this.repository.save(entity);
  }

  /**
   * Salva com transação e validação de capacidade
   * Usa isolamento SERIALIZABLE para prevenir race conditions
   */
  async saveWithCapacityCheck(
    attendance: Attendance,
    roomId: string,
    maxCapacity: number,
  ): Promise<{ success: boolean; reason?: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // Verificar idempotency key
      if (attendance.getIdempotencyKey()) {
        const existing = await queryRunner.manager.findOne(AttendanceEntity, {
          where: { idempotencyKey: attendance.getIdempotencyKey() },
        });

        if (existing) {
          await queryRunner.rollbackTransaction();
          return { success: false, reason: 'Duplicate request (idempotency key)' };
        }
      }

      // Contar check-ins ativos na sala (dentro da transação)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const currentCount = await queryRunner.manager.count(AttendanceEntity, {
        where: {
          roomId,
          checkInTime: Between(today, tomorrow),
        },
      });

      if (currentCount >= maxCapacity) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          reason: `Sala atingiu a capacidade máxima de ${maxCapacity} alunos`,
        };
      }

      // Salvar check-in
      const entity = this.repository.create({
        id: attendance.getId(),
        studentId: attendance.getStudentId(),
        roomId: attendance.getRoomId(),
        checkInTime: attendance.getCheckInTime(),
        idempotencyKey: attendance.getIdempotencyKey(),
        createdAt: attendance.getCreatedAt(),
        updatedAt: attendance.getUpdatedAt(),
      });

      await queryRunner.manager.save(AttendanceEntity, entity);
      await queryRunner.commitTransaction();

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Verifica se um idempotency key já existe
   */
  async findByIdempotencyKey(idempotencyKey: string): Promise<Attendance | null> {
    const entity = await this.repository.findOne({
      where: { idempotencyKey },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: AttendanceEntity): Attendance {
    return Attendance.reconstitute(
      entity.id,
      entity.studentId,
      entity.roomId,
      entity.checkInTime,
      entity.idempotencyKey,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}

