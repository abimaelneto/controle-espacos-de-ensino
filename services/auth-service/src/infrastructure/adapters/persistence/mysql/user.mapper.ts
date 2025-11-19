import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Role } from '../../../../domain/value-objects/role.vo';
import { PasswordHash } from '../../../../domain/value-objects/password-hash.vo';
import { UserEntity } from './user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return User.reconstitute(
      entity.id,
      new Email(entity.email),
      PasswordHash.fromHash(entity.passwordHash),
      new Role(entity.role),
      entity.status as 'ACTIVE' | 'INACTIVE',
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.getId();
    entity.email = user.getEmail().toString();
    entity.passwordHash = user['passwordHash'].toString(); // Access private field
    entity.role = user.getRole().getValue();
    entity.status = user.getStatus();
    entity.createdAt = user.getCreatedAt();
    entity.updatedAt = user.getUpdatedAt();
    return entity;
  }
}

