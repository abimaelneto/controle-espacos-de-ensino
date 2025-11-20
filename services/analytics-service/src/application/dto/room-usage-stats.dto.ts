import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RoomUsageStatsDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Data inicial do período',
  })
  @IsDateString({}, { message: 'Data inicial inválida' })
  @IsNotEmpty({ message: 'Data inicial é obrigatória' })
  startDate: string;

  @ApiProperty({
    example: '2024-01-31',
    description: 'Data final do período',
  })
  @IsDateString({}, { message: 'Data final inválida' })
  @IsNotEmpty({ message: 'Data final é obrigatória' })
  endDate: string;
}

