import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { StudentValidationService } from '../../domain/services/student-validation.service';
import { Student } from '../../domain/entities/student.entity';
import { FullName } from '../../domain/value-objects/full-name.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { UpdateStudentDto } from '../dto/update-student.dto';

export class UpdateStudentUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly validationService: StudentValidationService,
  ) {}

  async execute(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    // Atualizar nome se fornecido
    if (updateStudentDto.firstName || updateStudentDto.lastName) {
      const currentName = student.getName();
      const newFirstName =
        updateStudentDto.firstName || currentName.getFirstName();
      const newLastName =
        updateStudentDto.lastName || currentName.getLastName();
      const newFullName = new FullName(newFirstName, newLastName);
      student.updateName(newFullName);
    }

    // Atualizar email se fornecido
    if (updateStudentDto.email) {
      const newEmail = new Email(updateStudentDto.email);

      // Validar unicidade (exceto se for o mesmo email do aluno)
      if (!student.getEmail().equals(newEmail)) {
        const isEmailUnique =
          await this.validationService.validateEmailUniqueness(newEmail);
        if (!isEmailUnique) {
          throw new Error('Email já cadastrado');
        }
      }

      student.updateEmail(newEmail);
    }

    await this.studentRepository.save(student);

    return student;
  }
}

