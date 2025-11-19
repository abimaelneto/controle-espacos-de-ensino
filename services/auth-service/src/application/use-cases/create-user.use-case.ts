import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Role } from '../../domain/value-objects/role.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserCreatedEvent } from '../../domain/events/user-created.event';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    const email = new Email(createUserDto.email);
    const role = new Role(createUserDto.role);
    const passwordHash = await PasswordHash.fromPlain(createUserDto.password);

    const emailExists = await this.userRepository.exists(email);
    if (emailExists) {
      throw new Error('User with this email already exists');
    }

    const user = User.create(email, passwordHash, role);
    await this.userRepository.save(user);

    const event = new UserCreatedEvent(user.getId(), user.getEmail(), user.getRole());
    await this.eventPublisher.publish(event);

    return user;
  }
}

