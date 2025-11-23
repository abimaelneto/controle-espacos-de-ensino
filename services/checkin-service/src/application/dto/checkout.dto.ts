import {
  IsNotEmpty,
  IsString,
  IsIn,
} from 'class-validator';
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
    description: 'Valor da identificação',
  })
  @IsString()
  @IsNotEmpty()
  identificationValue: string;
}

