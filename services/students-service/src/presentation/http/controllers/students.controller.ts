import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateStudentUseCase } from '../../../application/use-cases/create-student.use-case';
import { GetStudentUseCase } from '../../../application/use-cases/get-student.use-case';
import { ListStudentsUseCase } from '../../../application/use-cases/list-students.use-case';
import { UpdateStudentUseCase } from '../../../application/use-cases/update-student.use-case';
import { DeleteStudentUseCase } from '../../../application/use-cases/delete-student.use-case';
import { FindStudentByCPFUseCase } from '../../../application/use-cases/find-student-by-cpf.use-case';
import { FindStudentByMatriculaUseCase } from '../../../application/use-cases/find-student-by-matricula.use-case';
import { CreateStudentDto } from '../../../application/dto/create-student.dto';
import { UpdateStudentDto } from '../../../application/dto/update-student.dto';
import { Student } from '../../../domain/entities/student.entity';

@ApiTags('students')
@Controller('api/v1/students')
export class StudentsController {
  constructor(
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly getStudentUseCase: GetStudentUseCase,
    private readonly listStudentsUseCase: ListStudentsUseCase,
    private readonly updateStudentUseCase: UpdateStudentUseCase,
    private readonly deleteStudentUseCase: DeleteStudentUseCase,
    private readonly findStudentByCPFUseCase: FindStudentByCPFUseCase,
    private readonly findStudentByMatriculaUseCase: FindStudentByMatriculaUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo aluno' })
  @ApiResponse({ status: 201, description: 'Aluno criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'CPF, email ou matrícula já cadastrados' })
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.createStudentUseCase.execute(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os alunos' })
  @ApiResponse({ status: 200, description: 'Lista de alunos' })
  async findAll(): Promise<Student[]> {
    return this.listStudentsUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar aluno por ID' })
  @ApiResponse({ status: 200, description: 'Aluno encontrado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  async findOne(@Param('id') id: string): Promise<Student | null> {
    return this.getStudentUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar aluno' })
  @ApiResponse({ status: 200, description: 'Aluno atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.updateStudentUseCase.execute(id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar aluno (soft delete)' })
  @ApiResponse({ status: 204, description: 'Aluno deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteStudentUseCase.execute(id);
  }

  @Get('cpf/:cpf')
  @ApiOperation({ summary: 'Buscar aluno por CPF' })
  @ApiResponse({ status: 200, description: 'Aluno encontrado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  async findByCPF(@Param('cpf') cpf: string) {
    const student = await this.findStudentByCPFUseCase.execute(cpf);
    if (!student) {
      return null;
    }
    return {
      id: student.getId(),
      userId: student.getUserId(),
      name: student.getName().getFullName(),
      cpf: student.getCPF().toString(),
      email: student.getEmail().toString(),
      matricula: student.getMatricula().toString(),
      status: student.getStatus(),
    };
  }

  @Get('matricula/:matricula')
  @ApiOperation({ summary: 'Buscar aluno por Matrícula' })
  @ApiResponse({ status: 200, description: 'Aluno encontrado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  async findByMatricula(@Param('matricula') matricula: string) {
    const student = await this.findStudentByMatriculaUseCase.execute(matricula);
    if (!student) {
      return null;
    }
    return {
      id: student.getId(),
      userId: student.getUserId(),
      name: student.getName().getFullName(),
      cpf: student.getCPF().toString(),
      email: student.getEmail().toString(),
      matricula: student.getMatricula().toString(),
      status: student.getStatus(),
    };
  }
}

