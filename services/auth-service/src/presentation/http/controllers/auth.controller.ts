import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticateUserUseCase } from '../../../application/use-cases/authenticate-user.use-case';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { JwtService } from '../../../application/services/jwt.service';
import { LoginDto } from '../../../application/dto/login.dto';
import { CreateUserDto } from '../../../application/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticateUseCase: AuthenticateUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authenticateUseCase.execute(loginDto);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.getId(),
        email: user.getEmail().toString(),
        role: user.getRole().getValue(),
      },
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já existe' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(createUserDto);

    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.getId(),
        email: user.getEmail().toString(),
        role: user.getRole().getValue(),
      },
    };
  }
}

