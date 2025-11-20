import { Student } from './student.entity';
import { FullName } from '../value-objects/full-name.vo';
import { CPF } from '../value-objects/cpf.vo';
import { Email } from '../value-objects/email.vo';
import { Matricula } from '../value-objects/matricula.vo';

describe('Student Entity', () => {
  let student: Student;
  let fullName: FullName;
  let cpf: CPF;
  let email: Email;
  let matricula: Matricula;
  const userId = 'user-123';

  beforeEach(() => {
    fullName = new FullName('João', 'Silva');
    cpf = new CPF('12345678909');
    email = new Email('joao@example.com');
    matricula = new Matricula('2024001234');
  });

  describe('create', () => {
    it('should create a new student', () => {
      student = Student.create(userId, fullName, cpf, email, matricula);

      expect(student).toBeDefined();
      expect(student.getId()).toBeDefined();
      expect(student.getUserId()).toBe(userId);
      expect(student.getName().getFullName()).toBe(fullName.getFullName());
      expect(student.getCPF().equals(cpf)).toBe(true);
      expect(student.getEmail().equals(email)).toBe(true);
      expect(student.getMatricula().equals(matricula)).toBe(true);
      expect(student.isActive()).toBe(true);
    });
  });

  describe('activate', () => {
    it('should activate student', () => {
      student = Student.create(userId, fullName, cpf, email, matricula);
      student.deactivate();
      expect(student.isActive()).toBe(false);

      student.activate();
      expect(student.isActive()).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate student', () => {
      student = Student.create(userId, fullName, cpf, email, matricula);
      expect(student.isActive()).toBe(true);

      student.deactivate();
      expect(student.isActive()).toBe(false);
    });
  });

  describe('softDelete', () => {
    it('should soft delete student', () => {
      student = Student.create(userId, fullName, cpf, email, matricula);
      expect(student.isDeleted()).toBe(false);

      student.softDelete();
      expect(student.isDeleted()).toBe(true);
      expect(student.getDeletedAt()).toBeInstanceOf(Date);
    });
  });

  describe('updateEmail', () => {
    it('should update email', () => {
      student = Student.create(userId, fullName, cpf, email, matricula);
      const newEmail = new Email('newemail@example.com');

      student.updateEmail(newEmail);
      expect(student.getEmail().equals(newEmail)).toBe(true);
    });
  });

  describe('canRegisterAttendance', () => {
    it('should return true for active and not deleted student', () => {
      student = Student.create(userId, fullName, cpf, email, matricula);
      expect(student.canRegisterAttendance()).toBe(true);
    });

    it('should return false for inactive student', () => {
      student = Student.create(userId, fullName, cpf, email, matricula);
      student.deactivate();
      expect(student.canRegisterAttendance()).toBe(false);
    });

    it('should return false for deleted student', () => {
      student = Student.create(userId, fullName, cpf, email, matricula);
      student.softDelete();
      expect(student.canRegisterAttendance()).toBe(false);
    });
  });
});

