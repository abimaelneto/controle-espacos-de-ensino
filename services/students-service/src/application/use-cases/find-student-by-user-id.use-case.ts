import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { Student } from '../../domain/entities/student.entity';

export class FindStudentByUserIdUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(userId: string): Promise<Student | null> {
    return this.studentRepository.findByUserId(userId);
  }
}

