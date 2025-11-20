import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDto {
  @ApiProperty({
    example: 'João',
    description: 'Primeiro nome do aluno',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Nome deve ter no máximo 50 caracteres' })
  firstName?: string;

  @ApiProperty({
    example: 'Silva',
    description: 'Sobrenome do aluno',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Sobrenome deve ser uma string' })
  @MinLength(3, { message: 'Sobrenome deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Sobrenome deve ter no máximo 50 caracteres' })
  lastName?: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do aluno',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;
}

