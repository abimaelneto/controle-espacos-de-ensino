import { IStudentsClient, StudentInfo } from '../../../../domain/ports/http/students-client.port';

const buildEmail = (identifier: string) => `${identifier.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@stress.local`;

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

export class MockStudentsClientAdapter implements IStudentsClient {
  private buildStudent(seed: string): StudentInfo {
    const normalized = seed || `stress-student-${Date.now().toString(36)}`;
    const digits = sanitizeDigits(normalized).padEnd(11, '0').substring(0, 11);

    return {
      id: normalized,
      userId: `user-${normalized}`,
      name: `Stress Student ${normalized}`,
      cpf: digits,
      email: buildEmail(normalized),
      matricula: `M-${digits}`,
      status: 'ACTIVE',
    };
  }

  async findStudentByCPF(cpf: string): Promise<StudentInfo | null> {
    if (!cpf) {
      return null;
    }
    return this.buildStudent(`stress-student-cpf-${sanitizeDigits(cpf)}`);
  }

  async findStudentByMatricula(matricula: string): Promise<StudentInfo | null> {
    if (!matricula) {
      return null;
    }
    return this.buildStudent(`stress-student-mat-${sanitizeDigits(matricula)}`);
  }

  async findStudentByUserId(userId: string): Promise<StudentInfo | null> {
    if (!userId) {
      return null;
    }
    return this.buildStudent(`stress-student-user-${sanitizeDigits(userId)}`);
  }

  async validateStudentActive(studentId: string): Promise<boolean> {
    return !!studentId;
  }
}


