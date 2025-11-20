import { IStudentRepository } from '../ports/repositories/student.repository.port';
import { CPF } from '../value-objects/cpf.vo';
import { Email } from '../value-objects/email.vo';
import { Matricula } from '../value-objects/matricula.vo';

export class StudentValidationService {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async validateCPFUniqueness(cpf: CPF): Promise<boolean> {
    const exists = await this.studentRepository.existsByCPF(cpf);
    return !exists;
  }

  async validateEmailUniqueness(email: Email): Promise<boolean> {
    const exists = await this.studentRepository.existsByEmail(email);
    return !exists;
  }

  async validateMatriculaUniqueness(matricula: Matricula): Promise<boolean> {
    const exists = await this.studentRepository.existsByMatricula(matricula);
    return !exists;
  }
}

