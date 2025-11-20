import {
  IsNotEmpty,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PerformCheckInDto {
  @ApiProperty({
    example: 'student-123',
    description: 'ID do aluno (será resolvido pelo método de identificação)',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

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
}

