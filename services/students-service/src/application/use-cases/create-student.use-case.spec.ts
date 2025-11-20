import { CreateStudentUseCase } from './create-student.use-case';
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

describe('CreateStudentUseCase', () => {
  let useCase: CreateStudentUseCase;
  let studentRepository: jest.Mocked<IStudentRepository>;
  let eventPublisher: jest.Mocked<IEventPublisher>;
  let validationService: jest.Mocked<StudentValidationService>;
  let student: Student;

  beforeEach(() => {
    studentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByCPF: jest.fn(),
      findByEmail: jest.fn(),
      findByMatricula: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByCPF: jest.fn(),
      existsByEmail: jest.fn(),
      existsByMatricula: jest.fn(),
    };

    eventPublisher = {
      publish: jest.fn(),
      publishMany: jest.fn(),
    };

    validationService = {
      validateCPFUniqueness: jest.fn(),
      validateEmailUniqueness: jest.fn(),
      validateMatriculaUniqueness: jest.fn(),
    } as any;

    useCase = new CreateStudentUseCase(
      studentRepository,
      eventPublisher,
      validationService,
    );

    const fullName = new FullName('João', 'Silva');
    const cpf = new CPF('12345678909');
    const email = new Email('joao@example.com');
    const matricula = new Matricula('2024001234');
    student = Student.create('user-123', fullName, cpf, email, matricula);
  });

  describe('execute', () => {
    it('should create student successfully', async () => {
      const createStudentDto: CreateStudentDto = {
        userId: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        matricula: '2024001234',
      };

      validationService.validateCPFUniqueness.mockResolvedValue(true);
      validationService.validateEmailUniqueness.mockResolvedValue(true);
      validationService.validateMatriculaUniqueness.mockResolvedValue(true);
      studentRepository.save.mockResolvedValue(undefined);
      eventPublisher.publish.mockResolvedValue(undefined);

      const result = await useCase.execute(createStudentDto);

      expect(result).toBeDefined();
      expect(result.getId()).toBeDefined();
      expect(result.getUserId()).toBe('user-123');
      expect(result.getName().getFullName()).toBe('João Silva');
      expect(result.getCPF().toString()).toBe('12345678909');
      expect(result.getEmail().toString()).toBe('joao@example.com');
      expect(result.getMatricula().toString()).toBe('2024001234');
      expect(result.isActive()).toBe(true);

      expect(validationService.validateCPFUniqueness).toHaveBeenCalled();
      expect(validationService.validateEmailUniqueness).toHaveBeenCalled();
      expect(validationService.validateMatriculaUniqueness).toHaveBeenCalled();
      expect(studentRepository.save).toHaveBeenCalled();
      expect(eventPublisher.publish).toHaveBeenCalledWith(
        expect.any(StudentCreatedEvent),
      );
    });

    it('should throw error if CPF already exists', async () => {
      const createStudentDto: CreateStudentDto = {
        userId: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        matricula: '2024001234',
      };

      validationService.validateCPFUniqueness.mockResolvedValue(false);

      await expect(useCase.execute(createStudentDto)).rejects.toThrow(
        'CPF já cadastrado',
      );

      expect(studentRepository.save).not.toHaveBeenCalled();
      expect(eventPublisher.publish).not.toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const createStudentDto: CreateStudentDto = {
        userId: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        matricula: '2024001234',
      };

      validationService.validateCPFUniqueness.mockResolvedValue(true);
      validationService.validateEmailUniqueness.mockResolvedValue(false);

      await expect(useCase.execute(createStudentDto)).rejects.toThrow(
        'Email já cadastrado',
      );
    });

    it('should throw error if matricula already exists', async () => {
      const createStudentDto: CreateStudentDto = {
        userId: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        matricula: '2024001234',
      };

      validationService.validateCPFUniqueness.mockResolvedValue(true);
      validationService.validateEmailUniqueness.mockResolvedValue(true);
      validationService.validateMatriculaUniqueness.mockResolvedValue(false);

      await expect(useCase.execute(createStudentDto)).rejects.toThrow(
        'Matrícula já cadastrada',
      );
    });
  });
});

