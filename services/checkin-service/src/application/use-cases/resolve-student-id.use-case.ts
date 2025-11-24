import { IStudentsClient } from '../../domain/ports/http/students-client.port';

export class ResolveStudentIdUseCase {
  constructor(private readonly studentsClient: IStudentsClient) {}

  async execute(
    method: string,
    value: string,
    userId?: string,
  ): Promise<string | null> {
    // Se tiver userId, tentar buscar por userId primeiro
    if (userId) {
      console.log(`[ResolveStudentId] Tentando resolver por userId: ${userId}`);
      const studentByUserId = await this.studentsClient.findStudentByUserId(userId);
      if (studentByUserId) {
        console.log(`[ResolveStudentId] Aluno encontrado por userId - id: ${studentByUserId.id}`);
        return studentByUserId.id;
      }
      console.log(`[ResolveStudentId] Aluno não encontrado por userId, tentando por método de identificação`);
    }

    console.log(`[ResolveStudentId] Resolvendo studentId - método: ${method}, valor: ${value}`);
    let student;

    switch (method) {
      case 'CPF':
        student = await this.studentsClient.findStudentByCPF(value);
        break;
      case 'MATRICULA':
        student = await this.studentsClient.findStudentByMatricula(value);
        break;
      default:
        console.log(`[ResolveStudentId] Método não suportado: ${method}`);
        return null;
    }

    if (!student) {
      console.log(`[ResolveStudentId] Aluno não encontrado - método: ${method}, valor: ${value}`);
      return null;
    }

    console.log(`[ResolveStudentId] Aluno encontrado - id: ${student.id}, método: ${method}, valor: ${value}`);
    return student?.id || null;
  }
}

