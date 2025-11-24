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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
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
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar novo aluno' })
  @ApiResponse({ status: 201, description: 'Aluno criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'CPF, email ou matrícula já cadastrados' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async create(@Body() createStudentDto: CreateStudentDto) {
    try {
      const student = await this.createStudentUseCase.execute(createStudentDto);
      return {
        id: student.getId(),
        userId: student.getUserId(),
        firstName: student.getName().getFirstName(),
        lastName: student.getName().getLastName(),
        cpf: student.getCPF().toString(),
        email: student.getEmail().toString(),
        matricula: student.getMatricula().toString(),
        status: student.getStatus(),
        createdAt: student.getCreatedAt(),
        updatedAt: student.getUpdatedAt(),
      };
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  }

  @Get()
  @Roles('ADMIN', 'MONITOR')
  @ApiOperation({ summary: 'Listar todos os alunos' })
  @ApiResponse({ status: 200, description: 'Lista de alunos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAll() {
    const students = await this.listStudentsUseCase.execute();
    return students.map((student) => ({
      id: student.getId(),
      userId: student.getUserId(),
      firstName: student.getName().getFirstName(),
      lastName: student.getName().getLastName(),
      cpf: student.getCPF().toString(),
      email: student.getEmail().toString(),
      matricula: student.getMatricula().toString(),
      status: student.getStatus(),
      createdAt: student.getCreatedAt(),
      updatedAt: student.getUpdatedAt(),
    }));
  }

  @Get(':id')
  @Roles('ADMIN', 'MONITOR', 'STUDENT')
  @ApiOperation({ summary: 'Buscar aluno por ID' })
  @ApiResponse({ status: 200, description: 'Aluno encontrado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findOne(@Param('id') id: string) {
    const student = await this.getStudentUseCase.execute(id);
    if (!student) {
      return null;
    }
    return {
      id: student.getId(),
      userId: student.getUserId(),
      firstName: student.getName().getFirstName(),
      lastName: student.getName().getLastName(),
      cpf: student.getCPF().toString(),
      email: student.getEmail().toString(),
      matricula: student.getMatricula().toString(),
      status: student.getStatus(),
      createdAt: student.getCreatedAt(),
      updatedAt: student.getUpdatedAt(),
    };
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar aluno' })
  @ApiResponse({ status: 200, description: 'Aluno atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.updateStudentUseCase.execute(id, updateStudentDto);
    return {
      id: student.getId(),
      userId: student.getUserId(),
      firstName: student.getName().getFirstName(),
      lastName: student.getName().getLastName(),
      cpf: student.getCPF().toString(),
      email: student.getEmail().toString(),
      matricula: student.getMatricula().toString(),
      status: student.getStatus(),
      createdAt: student.getCreatedAt(),
      updatedAt: student.getUpdatedAt(),
    };
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar aluno (soft delete)' })
  @ApiResponse({ status: 204, description: 'Aluno deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteStudentUseCase.execute(id);
  }

  @Get('cpf/:cpf')
  @Roles('ADMIN', 'MONITOR')
  @ApiOperation({ summary: 'Buscar aluno por CPF' })
  @ApiResponse({ status: 200, description: 'Aluno encontrado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findByCPF(@Param('cpf') cpf: string) {
    const student = await this.findStudentByCPFUseCase.execute(cpf);
    if (!student) {
      return null;
    }
    return {
      id: student.getId(),
      userId: student.getUserId(),
      firstName: student.getName().getFirstName(),
      lastName: student.getName().getLastName(),
      cpf: student.getCPF().toString(),
      email: student.getEmail().toString(),
      matricula: student.getMatricula().toString(),
      status: student.getStatus(),
      createdAt: student.getCreatedAt(),
      updatedAt: student.getUpdatedAt(),
    };
  }

  @Get('matricula/:matricula')
  @Roles('ADMIN', 'MONITOR')
  @ApiOperation({ summary: 'Buscar aluno por Matrícula' })
  @ApiResponse({ status: 200, description: 'Aluno encontrado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findByMatricula(@Param('matricula') matricula: string) {
    const student = await this.findStudentByMatriculaUseCase.execute(matricula);
    if (!student) {
      return null;
    }
    return {
      id: student.getId(),
      userId: student.getUserId(),
      firstName: student.getName().getFirstName(),
      lastName: student.getName().getLastName(),
      cpf: student.getCPF().toString(),
      email: student.getEmail().toString(),
      matricula: student.getMatricula().toString(),
      status: student.getStatus(),
      createdAt: student.getCreatedAt(),
      updatedAt: student.getUpdatedAt(),
    };
  }
}

