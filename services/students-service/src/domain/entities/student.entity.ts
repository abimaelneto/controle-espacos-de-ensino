import { FullName } from '../value-objects/full-name.vo';
import { CPF } from '../value-objects/cpf.vo';
import { Email } from '../value-objects/email.vo';
import { Matricula } from '../value-objects/matricula.vo';
import { randomUUID } from 'crypto';

export type StudentStatus = 'ACTIVE' | 'INACTIVE';

export class Student {
  private id: string;
  private userId: string; // Referência ao Identity Context
  private name: FullName;
  private cpf: CPF;
  private email: Email;
  private matricula: Matricula;
  private status: StudentStatus;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  private constructor(
    id: string,
    userId: string,
    name: FullName,
    cpf: CPF,
    email: Email,
    matricula: Matricula,
    status: StudentStatus,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.cpf = cpf;
    this.email = email;
    this.matricula = matricula;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  static create(
    userId: string,
    name: FullName,
    cpf: CPF,
    email: Email,
    matricula: Matricula,
  ): Student {
    const now = new Date();
    return new Student(
      randomUUID(),
      userId,
      name,
      cpf,
      email,
      matricula,
      'ACTIVE',
      now,
      now,
      null,
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    name: FullName,
    cpf: CPF,
    email: Email,
    matricula: Matricula,
    status: StudentStatus,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
  ): Student {
    return new Student(
      id,
      userId,
      name,
      cpf,
      email,
      matricula,
      status,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  activate(): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = 'INACTIVE';
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  updateEmail(newEmail: Email): void {
    this.email = newEmail;
    this.updatedAt = new Date();
  }

  updateName(newName: FullName): void {
    this.name = newName;
    this.updatedAt = new Date();
  }

  canRegisterAttendance(): boolean {
    return this.status === 'ACTIVE' && this.deletedAt === null;
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getName(): FullName {
    return this.name;
  }

  getCPF(): CPF {
    return this.cpf;
  }

  getEmail(): Email {
    return this.email;
  }

  getMatricula(): Matricula {
    return this.matricula;
  }

  getStatus(): StudentStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }
}

