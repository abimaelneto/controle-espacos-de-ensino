import { StudentValidationService } from './student-validation.service';
import { IStudentRepository } from '../ports/repositories/student.repository.port';
import { CPF } from '../value-objects/cpf.vo';
import { Email } from '../value-objects/email.vo';
import { Matricula } from '../value-objects/matricula.vo';

describe('StudentValidationService', () => {
  let service: StudentValidationService;
  let studentRepository: jest.Mocked<IStudentRepository>;

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

    service = new StudentValidationService(studentRepository);
  });

  describe('validateCPFUniqueness', () => {
    it('should return true if CPF does not exist', async () => {
      studentRepository.existsByCPF.mockResolvedValue(false);

      const cpf = new CPF('12345678909');
      const result = await service.validateCPFUniqueness(cpf);

      expect(result).toBe(true);
      expect(studentRepository.existsByCPF).toHaveBeenCalledWith(cpf);
    });

    it('should return false if CPF already exists', async () => {
      studentRepository.existsByCPF.mockResolvedValue(true);

      const cpf = new CPF('12345678909');
      const result = await service.validateCPFUniqueness(cpf);

      expect(result).toBe(false);
    });
  });

  describe('validateEmailUniqueness', () => {
    it('should return true if email does not exist', async () => {
      studentRepository.existsByEmail.mockResolvedValue(false);

      const email = new Email('test@example.com');
      const result = await service.validateEmailUniqueness(email);

      expect(result).toBe(true);
    });

    it('should return false if email already exists', async () => {
      studentRepository.existsByEmail.mockResolvedValue(true);

      const email = new Email('test@example.com');
      const result = await service.validateEmailUniqueness(email);

      expect(result).toBe(false);
    });
  });

  describe('validateMatriculaUniqueness', () => {
    it('should return true if matricula does not exist', async () => {
      studentRepository.existsByMatricula.mockResolvedValue(false);

      const matricula = new Matricula('2024001234');
      const result = await service.validateMatriculaUniqueness(matricula);

      expect(result).toBe(true);
    });

    it('should return false if matricula already exists', async () => {
      studentRepository.existsByMatricula.mockResolvedValue(true);

      const matricula = new Matricula('2024001234');
      const result = await service.validateMatriculaUniqueness(matricula);

      expect(result).toBe(false);
    });
  });
});

