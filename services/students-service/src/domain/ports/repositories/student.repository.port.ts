import { Student } from '../../entities/student.entity';
import { CPF } from '../../value-objects/cpf.vo';
import { Email } from '../../value-objects/email.vo';
import { Matricula } from '../../value-objects/matricula.vo';

/**
 * Port: Interface para repositório de alunos
 * Implementado por adapters (MySQL, RDS, etc.)
 */
export interface IStudentRepository {
  findById(id: string): Promise<Student | null>;
  findByUserId(userId: string): Promise<Student | null>;
  findByCPF(cpf: CPF): Promise<Student | null>;
  findByEmail(email: Email): Promise<Student | null>;
  findByMatricula(matricula: Matricula): Promise<Student | null>;
  findAll(includeDeleted?: boolean): Promise<Student[]>;
  save(student: Student): Promise<void>;
  delete(id: string): Promise<void>;
  existsByCPF(cpf: CPF): Promise<boolean>;
  existsByEmail(email: Email): Promise<boolean>;
  existsByMatricula(matricula: Matricula): Promise<boolean>;
}

