import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PerformCheckInDto {
  @ApiProperty({
    example: 'student-123',
    description: 'ID do aluno (será resolvido pelo método de identificação se não fornecido)',
    required: false,
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({
    example: 'user-123',
    description: 'ID do usuário (será usado para buscar studentId se não fornecido)',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    example: 'room-456',
    description: 'ID da sala',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    example: 'MATRICULA',
    description: 'Método de identificação',
    enum: ['CPF', 'MATRICULA', 'QR_CODE', 'BIOMETRIC'],
  })
  @IsString()
  @IsIn(['CPF', 'MATRICULA', 'QR_CODE', 'BIOMETRIC'])
  identificationMethod: string;

  @ApiProperty({
    example: '2024001234',
    description: 'Valor da identificação',
  })
  @IsString()
  @IsNotEmpty()
  identificationValue: string;

  @ApiProperty({
    example: 'req-123e4567-e89b-12d3-a456-426614174000',
    description: 'Chave de idempotência (opcional, gerada automaticamente se não fornecida)',
    required: false,
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

