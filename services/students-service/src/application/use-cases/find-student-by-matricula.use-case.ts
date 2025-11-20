import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { Matricula } from '../../domain/value-objects/matricula.vo';
import { Student } from '../../domain/entities/student.entity';

export class FindStudentByMatriculaUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(matricula: string): Promise<Student | null> {
    const matriculaVO = new Matricula(matricula);
    return this.studentRepository.findByMatricula(matriculaVO);
  }
}

