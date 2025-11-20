import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { Student } from '../../domain/entities/student.entity';

export class DeleteStudentUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    student.softDelete();
    await this.studentRepository.save(student);
  }
}

