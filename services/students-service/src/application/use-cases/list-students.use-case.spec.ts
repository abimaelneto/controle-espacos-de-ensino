import { ListStudentsUseCase } from './list-students.use-case';
import { IStudentRepository } from '../../domain/ports/repositories/student.repository.port';
import { Student } from '../../domain/entities/student.entity';
import { FullName } from '../../domain/value-objects/full-name.vo';
import { CPF } from '../../domain/value-objects/cpf.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { Matricula } from '../../domain/value-objects/matricula.vo';

describe('ListStudentsUseCase', () => {
  let useCase: ListStudentsUseCase;
  let studentRepository: jest.Mocked<IStudentRepository>;
  let students: Student[];

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

    useCase = new ListStudentsUseCase(studentRepository);

    const student1 = Student.create(
      'user-1',
      new FullName('João', 'Silva'),
      new CPF('12345678909'),
      new Email('joao@example.com'),
      new Matricula('2024001234'),
    );

    const student2 = Student.create(
      'user-2',
      new FullName('Maria', 'Santos'),
      new CPF('98765432100'),
      new Email('maria@example.com'),
      new Matricula('2024005678'),
    );

    students = [student1, student2];
  });

  describe('execute', () => {
    it('should return all active students by default', async () => {
      studentRepository.findAll.mockResolvedValue(students);

      const result = await useCase.execute();

      expect(result).toEqual(students);
      expect(studentRepository.findAll).toHaveBeenCalledWith(false);
    });

    it('should return all students including deleted when requested', async () => {
      studentRepository.findAll.mockResolvedValue(students);

      const result = await useCase.execute(true);

      expect(result).toEqual(students);
      expect(studentRepository.findAll).toHaveBeenCalledWith(true);
    });

    it('should return empty array when no students found', async () => {
      studentRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });
  });
});

