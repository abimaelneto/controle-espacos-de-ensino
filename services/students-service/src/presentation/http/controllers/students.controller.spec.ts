import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { CreateStudentUseCase } from '../../../application/use-cases/create-student.use-case';
import { GetStudentUseCase } from '../../../application/use-cases/get-student.use-case';
import { ListStudentsUseCase } from '../../../application/use-cases/list-students.use-case';
import { UpdateStudentUseCase } from '../../../application/use-cases/update-student.use-case';
import { DeleteStudentUseCase } from '../../../application/use-cases/delete-student.use-case';
import { Student } from '../../../domain/entities/student.entity';
import { FullName } from '../../../domain/value-objects/full-name.vo';
import { CPF } from '../../../domain/value-objects/cpf.vo';
import { Email } from '../../../domain/value-objects/email.vo';
import { Matricula } from '../../../domain/value-objects/matricula.vo';
import { CreateStudentDto } from '../../../application/dto/create-student.dto';
import { UpdateStudentDto } from '../../../application/dto/update-student.dto';

describe('StudentsController', () => {
  let controller: StudentsController;
  let createStudentUseCase: jest.Mocked<CreateStudentUseCase>;
  let getStudentUseCase: jest.Mocked<GetStudentUseCase>;
  let listStudentsUseCase: jest.Mocked<ListStudentsUseCase>;
  let updateStudentUseCase: jest.Mocked<UpdateStudentUseCase>;
  let deleteStudentUseCase: jest.Mocked<DeleteStudentUseCase>;
  let student: Student;

  beforeEach(async () => {
    const fullName = new FullName('João', 'Silva');
    const cpf = new CPF('12345678909');
    const email = new Email('joao@example.com');
    const matricula = new Matricula('2024001234');
    student = Student.create('user-123', fullName, cpf, email, matricula);

    createStudentUseCase = {
      execute: jest.fn(),
    } as any;

    getStudentUseCase = {
      execute: jest.fn(),
    } as any;

    listStudentsUseCase = {
      execute: jest.fn(),
    } as any;

    updateStudentUseCase = {
      execute: jest.fn(),
    } as any;

    deleteStudentUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: CreateStudentUseCase,
          useValue: createStudentUseCase,
        },
        {
          provide: GetStudentUseCase,
          useValue: getStudentUseCase,
        },
        {
          provide: ListStudentsUseCase,
          useValue: listStudentsUseCase,
        },
        {
          provide: UpdateStudentUseCase,
          useValue: updateStudentUseCase,
        },
        {
          provide: DeleteStudentUseCase,
          useValue: deleteStudentUseCase,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
  });

  describe('create', () => {
    it('should create a student', async () => {
      const createDto: CreateStudentDto = {
        userId: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        matricula: '2024001234',
      };

      createStudentUseCase.execute.mockResolvedValue(student);

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(createStudentUseCase.execute).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findOne', () => {
    it('should return a student', async () => {
      getStudentUseCase.execute.mockResolvedValue(student);

      const result = await controller.findOne(student.getId());

      expect(result).toBe(student);
      expect(getStudentUseCase.execute).toHaveBeenCalledWith(student.getId());
    });
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      listStudentsUseCase.execute.mockResolvedValue([student]);

      const result = await controller.findAll();

      expect(result).toEqual([student]);
      expect(listStudentsUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      const updateDto: UpdateStudentDto = {
        firstName: 'José',
      };

      const updatedStudent = Student.create(
        'user-123',
        new FullName('José', 'Silva'),
        new CPF('12345678909'),
        new Email('joao@example.com'),
        new Matricula('2024001234'),
      );

      updateStudentUseCase.execute.mockResolvedValue(updatedStudent);

      const result = await controller.update(student.getId(), updateDto);

      expect(result).toBe(updatedStudent);
      expect(updateStudentUseCase.execute).toHaveBeenCalledWith(
        student.getId(),
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a student', async () => {
      deleteStudentUseCase.execute.mockResolvedValue(undefined);

      await controller.remove(student.getId());

      expect(deleteStudentUseCase.execute).toHaveBeenCalledWith(
        student.getId(),
      );
    });
  });
});

