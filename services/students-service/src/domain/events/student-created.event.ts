import { IDomainEvent } from './domain-event.interface';
import { Student } from '../entities/student.entity';

export class StudentCreatedEvent implements IDomainEvent {
  readonly eventType = 'StudentCreated';
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly topic = 'student.events';
  readonly payload: {
    studentId: string;
    userId: string;
    email: string;
    cpf: string;
    matricula: string;
  };

  constructor(student: Student) {
    this.aggregateId = student.getId();
    this.occurredAt = new Date();
    this.payload = {
      studentId: student.getId(),
      userId: student.getUserId(),
      email: student.getEmail().toString(),
      cpf: student.getCPF().toString(),
      matricula: student.getMatricula().toString(),
    };
  }
}

