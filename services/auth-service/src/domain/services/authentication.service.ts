import { IUserRepository } from '../ports/repositories/user.repository.port';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

export class AuthenticationService {
  constructor(private readonly userRepository: IUserRepository) {}

  async authenticate(
    email: Email,
    plainPassword: string,
  ): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    if (!user.isActive()) {
      return null;
    }

    const isValid = await user.authenticate(plainPassword);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    if (!user.isActive()) {
      return null;
    }

    return user;
  }
}

