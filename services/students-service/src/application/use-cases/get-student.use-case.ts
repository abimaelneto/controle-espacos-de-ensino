import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { Student } from '../../domain/entities/student.entity';

export class GetStudentUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(id: string): Promise<Student | null> {
    return this.studentRepository.findById(id);
  }
}

