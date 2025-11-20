import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { CPF } from '../../domain/value-objects/cpf.vo';
import { Student } from '../../domain/entities/student.entity';

export class FindStudentByCPFUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(cpf: string): Promise<Student | null> {
    const cpfVO = new CPF(cpf);
    return this.studentRepository.findByCPF(cpfVO);
  }
}

