import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MySQLStudentRepositoryAdapter } from './mysql-student.repository.adapter';
import { StudentEntity } from './student.entity';
import { StudentMapper } from './student.mapper';
import { Student } from '../../../../domain/entities/student.entity';
import { FullName } from '../../../../domain/value-objects/full-name.vo';
import { CPF } from '../../../../domain/value-objects/cpf.vo';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Matricula } from '../../../../domain/value-objects/matricula.vo';

describe('MySQLStudentRepositoryAdapter', () => {
  let adapter: MySQLStudentRepositoryAdapter;
  let repository: jest.Mocked<Repository<StudentEntity>>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySQLStudentRepositoryAdapter,
        {
          provide: getRepositoryToken(StudentEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<MySQLStudentRepositoryAdapter>(
      MySQLStudentRepositoryAdapter,
    );
    repository = module.get(getRepositoryToken(StudentEntity));
  });

  describe('findById', () => {
    it('should return student when found', async () => {
      const entity = new StudentEntity();
      entity.id = 'student-123';
      entity.userId = 'user-123';
      entity.firstName = 'João';
      entity.lastName = 'Silva';
      entity.cpf = '12345678909';
      entity.email = 'joao@example.com';
      entity.matricula = '2024001234';
      entity.status = 'ACTIVE';
      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      entity.deletedAt = null;

      repository.findOne.mockResolvedValue(entity);

      const result = await adapter.findById('student-123');

      expect(result).toBeDefined();
      expect(result?.getId()).toBe('student-123');
      expect(result?.getUserId()).toBe('user-123');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'student-123' },
      });
    });

    it('should return null when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save new student', async () => {
      const student = Student.create(
        'user-123',
        new FullName('João', 'Silva'),
        new CPF('12345678909'),
        new Email('joao@example.com'),
        new Matricula('2024001234'),
      );

      const entity = new StudentEntity();
      entity.id = student.getId();
      Object.assign(entity, StudentMapper.toPersistence(student));

      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      await adapter.save(student);

      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('existsByCPF', () => {
    it('should return true if CPF exists', async () => {
      const entity = new StudentEntity();
      entity.cpf = '12345678909';

      repository.findOne.mockResolvedValue(entity);

      const result = await adapter.existsByCPF(new CPF('12345678909'));

      expect(result).toBe(true);
    });

    it('should return false if CPF does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.existsByCPF(new CPF('12345678909'));

      expect(result).toBe(false);
    });
  });

  describe('existsByEmail', () => {
    it('should return true if email exists', async () => {
      const entity = new StudentEntity();
      entity.email = 'joao@example.com';

      repository.findOne.mockResolvedValue(entity);

      const result = await adapter.existsByEmail(new Email('joao@example.com'));

      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.existsByEmail(new Email('joao@example.com'));

      expect(result).toBe(false);
    });
  });

  describe('existsByMatricula', () => {
    it('should return true if matricula exists', async () => {
      const entity = new StudentEntity();
      entity.matricula = '2024001234';

      repository.findOne.mockResolvedValue(entity);

      const result = await adapter.existsByMatricula(
        new Matricula('2024001234'),
      );

      expect(result).toBe(true);
    });

    it('should return false if matricula does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.existsByMatricula(
        new Matricula('2024001234'),
      );

      expect(result).toBe(false);
    });
  });
});

