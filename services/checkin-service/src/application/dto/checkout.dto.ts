import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PerformCheckOutDto {
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
    description:
      'Valor da identificação (opcional quando usuário autenticado possui studentId vinculado)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  identificationValue?: string;
}

