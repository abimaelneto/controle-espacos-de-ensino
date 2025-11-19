import { User } from '../../entities/user.entity';
import { Email } from '../../value-objects/email.vo';

/**
 * Port: Interface para repositório de usuários
 * Implementado por adapters (MySQL, RDS, etc.)
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  exists(email: Email): Promise<boolean>;
}

