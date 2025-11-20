import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { Student } from '../../domain/entities/student.entity';

export class ListStudentsUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(includeDeleted = false): Promise<Student[]> {
    return this.studentRepository.findAll(includeDeleted);
  }
}

