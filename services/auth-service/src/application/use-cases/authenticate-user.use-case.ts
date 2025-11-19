import { AuthenticationService } from '../../domain/services/authentication.service';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { LoginDto } from '../dto/login.dto';

export class AuthenticateUserUseCase {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(loginDto: LoginDto): Promise<User | null> {
    const email = new Email(loginDto.email);
    return this.authenticationService.authenticate(email, loginDto.password);
  }
}

