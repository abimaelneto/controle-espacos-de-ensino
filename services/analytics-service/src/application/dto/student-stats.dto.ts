import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StudentStatsDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Data inicial do período (opcional)',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data inicial inválida' })
  startDate?: string;

  @ApiProperty({
    example: '2024-01-31',
    description: 'Data final do período (opcional)',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data final inválida' })
  endDate?: string;
}

