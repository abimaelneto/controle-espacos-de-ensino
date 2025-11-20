import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoomDto {
  @ApiProperty({
    example: 50,
    description: 'Nova capacidade da sala',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Capacidade deve ser um número' })
  @Min(1, { message: 'Capacidade deve ser maior que zero' })
  @Max(10000, { message: 'Capacidade não pode ser maior que 10000' })
  capacity?: number;

  @ApiProperty({
    example: 'Sala atualizada',
    description: 'Nova descrição da sala',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Se a sala possui equipamentos',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'hasEquipment deve ser um booleano' })
  hasEquipment?: boolean;
}

