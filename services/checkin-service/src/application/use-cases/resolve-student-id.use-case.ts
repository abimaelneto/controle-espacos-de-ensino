import { IStudentsClient } from '../../domain/ports/http/students-client.port';

export class ResolveStudentIdUseCase {
  constructor(private readonly studentsClient: IStudentsClient) {}

  async execute(
    method: string,
    value: string,
  ): Promise<string | null> {
    let student;

    switch (method) {
      case 'CPF':
        student = await this.studentsClient.findStudentByCPF(value);
        break;
      case 'MATRICULA':
        student = await this.studentsClient.findStudentByMatricula(value);
        break;
      default:
        return null;
    }

    return student?.id || null;
  }
}

