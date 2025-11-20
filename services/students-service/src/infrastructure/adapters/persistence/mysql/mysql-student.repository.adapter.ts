import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStudentRepository } from '../../../../domain/ports/repositories/student.repository.port';
import { Student } from '../../../../domain/entities/student.entity';
import { CPF } from '../../../../domain/value-objects/cpf.vo';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Matricula } from '../../../../domain/value-objects/matricula.vo';
import { StudentEntity } from './student.entity';
import { StudentMapper } from './student.mapper';

@Injectable()
export class MySQLStudentRepositoryAdapter implements IStudentRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repository: Repository<StudentEntity>,
  ) {}

  async findById(id: string): Promise<Student | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? StudentMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Student | null> {
    const entity = await this.repository.findOne({ where: { userId } });
    return entity ? StudentMapper.toDomain(entity) : null;
  }

  async findByCPF(cpf: CPF): Promise<Student | null> {
    const entity = await this.repository.findOne({
      where: { cpf: cpf.toString() },
    });
    return entity ? StudentMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<Student | null> {
    const entity = await this.repository.findOne({
      where: { email: email.toString() },
    });
    return entity ? StudentMapper.toDomain(entity) : null;
  }

  async findByMatricula(matricula: Matricula): Promise<Student | null> {
    const entity = await this.repository.findOne({
      where: { matricula: matricula.toString() },
    });
    return entity ? StudentMapper.toDomain(entity) : null;
  }

  async findAll(includeDeleted = false): Promise<Student[]> {
    const where: any = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const entities = await this.repository.find({ where });
    return entities.map((entity) => StudentMapper.toDomain(entity));
  }

  async save(student: Student): Promise<void> {
    const existingEntity = await this.repository.findOne({
      where: { id: student.getId() },
    });

    if (existingEntity) {
      // Update
      const persistenceData = StudentMapper.toPersistence(student);
      Object.assign(existingEntity, persistenceData);
      await this.repository.save(existingEntity);
    } else {
      // Create
      const entity = this.repository.create({
        id: student.getId(),
        ...StudentMapper.toPersistence(student),
        createdAt: student.getCreatedAt(),
        updatedAt: student.getUpdatedAt(),
      });
      await this.repository.save(entity);
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByCPF(cpf: CPF): Promise<boolean> {
    const entity = await this.repository.findOne({
      where: { cpf: cpf.toString() },
    });
    return entity !== null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const entity = await this.repository.findOne({
      where: { email: email.toString() },
    });
    return entity !== null;
  }

  async existsByMatricula(matricula: Matricula): Promise<boolean> {
    const entity = await this.repository.findOne({
      where: { matricula: matricula.toString() },
    });
    return entity !== null;
  }
}

