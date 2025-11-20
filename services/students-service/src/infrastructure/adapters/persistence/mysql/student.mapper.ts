import { Student } from '../../../../domain/entities/student.entity';
import { StudentEntity } from './student.entity';
import { FullName } from '../../../../domain/value-objects/full-name.vo';
import { CPF } from '../../../../domain/value-objects/cpf.vo';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Matricula } from '../../../../domain/value-objects/matricula.vo';

export class StudentMapper {
  static toDomain(entity: StudentEntity): Student {
    return Student.reconstitute(
      entity.id,
      entity.userId,
      new FullName(entity.firstName, entity.lastName),
      new CPF(entity.cpf),
      new Email(entity.email),
      new Matricula(entity.matricula),
      entity.status,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }

  static toPersistence(student: Student): Omit<StudentEntity, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId: student.getUserId(),
      firstName: student.getName().getFirstName(),
      lastName: student.getName().getLastName(),
      cpf: student.getCPF().toString(),
      email: student.getEmail().toString(),
      matricula: student.getMatricula().toString(),
      status: student.getStatus(),
      deletedAt: student.getDeletedAt(),
    };
  }
}

