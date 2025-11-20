import { UpdateStudentUseCase } from './update-student.use-case';
import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { StudentValidationService } from '../../domain/services/student-validation.service';
import { Student } from '../../domain/entities/student.entity';
import { FullName } from '../../domain/value-objects/full-name.vo';
import { CPF } from '../../domain/value-objects/cpf.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { Matricula } from '../../domain/value-objects/matricula.vo';
import { UpdateStudentDto } from '../dto/update-student.dto';

describe('UpdateStudentUseCase', () => {
  let useCase: UpdateStudentUseCase;
  let studentRepository: jest.Mocked<IStudentRepository>;
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

    validationService = {
      validateEmailUniqueness: jest.fn(),
    } as any;

    useCase = new UpdateStudentUseCase(
      studentRepository,
      validationService,
    );

    const fullName = new FullName('João', 'Silva');
    const cpf = new CPF('12345678909');
    const email = new Email('joao@example.com');
    const matricula = new Matricula('2024001234');
    student = Student.create('user-123', fullName, cpf, email, matricula);
  });

  describe('execute', () => {
    it('should update student name', async () => {
      studentRepository.findById.mockResolvedValue(student);
      studentRepository.save.mockResolvedValue(undefined);

      const updateDto: UpdateStudentDto = {
        firstName: 'José',
        lastName: 'Oliveira',
      };

      const result = await useCase.execute(student.getId(), updateDto);

      expect(result.getName().getFullName()).toBe('José Oliveira');
      expect(studentRepository.save).toHaveBeenCalled();
    });

    it('should update student email', async () => {
      studentRepository.findById.mockResolvedValue(student);
      validationService.validateEmailUniqueness.mockResolvedValue(true);
      studentRepository.save.mockResolvedValue(undefined);

      const updateDto: UpdateStudentDto = {
        email: 'newemail@example.com',
      };

      const result = await useCase.execute(student.getId(), updateDto);

      expect(result.getEmail().toString()).toBe('newemail@example.com');
      expect(validationService.validateEmailUniqueness).toHaveBeenCalled();
    });

    it('should throw error if student not found', async () => {
      studentRepository.findById.mockResolvedValue(null);

      const updateDto: UpdateStudentDto = {
        firstName: 'José',
      };

      await expect(
        useCase.execute('non-existent-id', updateDto),
      ).rejects.toThrow('Aluno não encontrado');
    });

    it('should throw error if email already exists', async () => {
      studentRepository.findById.mockResolvedValue(student);
      validationService.validateEmailUniqueness.mockResolvedValue(false);

      const updateDto: UpdateStudentDto = {
        email: 'existing@example.com',
      };

      await expect(
        useCase.execute(student.getId(), updateDto),
      ).rejects.toThrow('Email já cadastrado');
    });
  });
});

