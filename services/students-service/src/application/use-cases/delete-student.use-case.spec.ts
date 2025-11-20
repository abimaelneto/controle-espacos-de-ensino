import { DeleteStudentUseCase } from './delete-student.use-case';
import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { Student } from '../../domain/entities/student.entity';
import { FullName } from '../../domain/value-objects/full-name.vo';
import { CPF } from '../../domain/value-objects/cpf.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { Matricula } from '../../domain/value-objects/matricula.vo';

describe('DeleteStudentUseCase', () => {
  let useCase: DeleteStudentUseCase;
  let studentRepository: jest.Mocked<IStudentRepository>;
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

    useCase = new DeleteStudentUseCase(studentRepository);

    const fullName = new FullName('João', 'Silva');
    const cpf = new CPF('12345678909');
    const email = new Email('joao@example.com');
    const matricula = new Matricula('2024001234');
    student = Student.create('user-123', fullName, cpf, email, matricula);
  });

  describe('execute', () => {
    it('should soft delete student', async () => {
      studentRepository.findById.mockResolvedValue(student);
      studentRepository.save.mockResolvedValue(undefined);

      await useCase.execute(student.getId());

      expect(student.isDeleted()).toBe(true);
      expect(student.getDeletedAt()).toBeInstanceOf(Date);
      expect(studentRepository.save).toHaveBeenCalled();
    });

    it('should throw error if student not found', async () => {
      studentRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        'Aluno não encontrado',
      );
    });
  });
});

