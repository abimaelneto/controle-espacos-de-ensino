import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { StudentValidationService } from '../../domain/services/student-validation.service';
import { Student } from '../../domain/entities/student.entity';
import { FullName } from '../../domain/value-objects/full-name.vo';
import { CPF } from '../../domain/value-objects/cpf.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { Matricula } from '../../domain/value-objects/matricula.vo';
import { CreateStudentDto } from '../dto/create-student.dto';
import { StudentCreatedEvent } from '../../domain/events/student-created.event';
import { BusinessMetricsService } from '../../infrastructure/metrics/business-metrics.service';

export class CreateStudentUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly validationService: StudentValidationService,
    private readonly metrics?: BusinessMetricsService,
  ) {}

  async execute(createStudentDto: CreateStudentDto): Promise<Student> {
    const fullName = new FullName(
      createStudentDto.firstName,
      createStudentDto.lastName,
    );
    const cpf = new CPF(createStudentDto.cpf);
    const email = new Email(createStudentDto.email);
    const matricula = new Matricula(createStudentDto.matricula);

    // Validar unicidade
    const isCPFUnique = await this.validationService.validateCPFUniqueness(
      cpf,
    );
    if (!isCPFUnique) {
      throw new Error('CPF já cadastrado');
    }

    const isEmailUnique =
      await this.validationService.validateEmailUniqueness(email);
    if (!isEmailUnique) {
      throw new Error('Email já cadastrado');
    }

    const isMatriculaUnique =
      await this.validationService.validateMatriculaUniqueness(matricula);
    if (!isMatriculaUnique) {
      throw new Error('Matrícula já cadastrada');
    }

    const student = Student.create(
      createStudentDto.userId,
      fullName,
      cpf,
      email,
      matricula,
    );

    await this.studentRepository.save(student);

    const event = new StudentCreatedEvent(student);
    await this.eventPublisher.publish(event);

    // Metrics
    this.metrics?.incrementStudentsCreated(student.getStatus());

    return student;
  }
}

