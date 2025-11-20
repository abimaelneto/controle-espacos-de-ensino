import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    example: 'user-123',
    description: 'ID do usuário no Identity Context',
  })
  @IsString({ message: 'User ID deve ser uma string' })
  @IsNotEmpty({ message: 'User ID é obrigatório' })
  userId: string;

  @ApiProperty({
    example: 'João',
    description: 'Primeiro nome do aluno',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Nome deve ter no máximo 50 caracteres' })
  firstName: string;

  @ApiProperty({
    example: 'Silva',
    description: 'Sobrenome do aluno',
  })
  @IsString({ message: 'Sobrenome deve ser uma string' })
  @IsNotEmpty({ message: 'Sobrenome é obrigatório' })
  @MinLength(3, { message: 'Sobrenome deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Sobrenome deve ter no máximo 50 caracteres' })
  lastName: string;

  @ApiProperty({
    example: '12345678909',
    description: 'CPF do aluno (apenas números)',
  })
  @IsString({ message: 'CPF deve ser uma string' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @Matches(/^\d{11}$/, {
    message: 'CPF deve conter exatamente 11 dígitos',
  })
  cpf: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do aluno',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    example: '2024001234',
    description: 'Matrícula do aluno',
  })
  @IsString({ message: 'Matrícula deve ser uma string' })
  @IsNotEmpty({ message: 'Matrícula é obrigatória' })
  @MinLength(5, { message: 'Matrícula deve ter no mínimo 5 caracteres' })
  @MaxLength(16, { message: 'Matrícula deve ter no máximo 16 caracteres' })
  matricula: string;
}

