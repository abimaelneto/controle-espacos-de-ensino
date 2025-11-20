import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    example: 'A101',
    description: 'Número da sala',
  })
  @IsString({ message: 'Número da sala deve ser uma string' })
  @IsNotEmpty({ message: 'Número da sala é obrigatório' })
  @MinLength(3, { message: 'Número da sala deve ter no mínimo 3 caracteres' })
  @MaxLength(20, { message: 'Número da sala deve ter no máximo 20 caracteres' })
  roomNumber: string;

  @ApiProperty({
    example: 30,
    description: 'Capacidade da sala',
  })
  @IsNumber({}, { message: 'Capacidade deve ser um número' })
  @IsNotEmpty({ message: 'Capacidade é obrigatória' })
  @Min(1, { message: 'Capacidade deve ser maior que zero' })
  @Max(10000, { message: 'Capacidade não pode ser maior que 10000' })
  capacity: number;

  @ApiProperty({
    example: 'CLASSROOM',
    description: 'Tipo da sala',
    enum: ['CLASSROOM', 'LABORATORY', 'AUDITORIUM', 'STUDY_ROOM'],
  })
  @IsString({ message: 'Tipo da sala deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo da sala é obrigatório' })
  @IsIn(['CLASSROOM', 'LABORATORY', 'AUDITORIUM', 'STUDY_ROOM'], {
    message: 'Tipo de sala inválido',
  })
  type: string;

  @ApiProperty({
    example: 'Sala de aula padrão',
    description: 'Descrição da sala',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  description?: string;

  @ApiProperty({
    example: false,
    description: 'Se a sala possui equipamentos',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'hasEquipment deve ser um booleano' })
  hasEquipment?: boolean;
}

