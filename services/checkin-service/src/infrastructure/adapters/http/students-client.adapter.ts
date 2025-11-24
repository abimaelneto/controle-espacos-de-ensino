import { Injectable, Scope } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IStudentsClient, StudentInfo } from '../../../domain/ports/http/students-client.port';

@Injectable({ scope: Scope.REQUEST })
export class StudentsClientAdapter implements IStudentsClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly request: any,
  ) {
    this.baseUrl =
      this.configService.get<string>('STUDENTS_SERVICE_URL') ||
      'http://localhost:3001/api/v1';
  }

  private getAuthHeader(): string | undefined {
    return this.request?.headers?.authorization;
  }

  async findStudentByCPF(cpf: string): Promise<StudentInfo | null> {
    try {
      const url = `${this.baseUrl}/students/cpf/${cpf}`;
      console.log(`[StudentsClient] Buscando aluno por CPF: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<StudentInfo>(url),
      );
      console.log(`[StudentsClient] Aluno encontrado por CPF:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[StudentsClient] Erro ao buscar aluno por CPF:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseUrl}/students/cpf/${cpf}`,
      });
      return null;
    }
  }

  async findStudentByMatricula(matricula: string): Promise<StudentInfo | null> {
    try {
      const url = `${this.baseUrl}/students/matricula/${matricula}`;
      console.log(`[StudentsClient] Buscando aluno por Matrícula: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<StudentInfo>(url),
      );
      console.log(`[StudentsClient] Aluno encontrado por Matrícula:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[StudentsClient] Erro ao buscar aluno por Matrícula:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseUrl}/students/matricula/${matricula}`,
      });
      return null;
    }
  }

  async findStudentByUserId(userId: string): Promise<StudentInfo | null> {
    try {
      const url = `${this.baseUrl}/students/user/${userId}`;
      console.log(`[StudentsClient] Buscando aluno por userId: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<StudentInfo>(url),
      );
      console.log(`[StudentsClient] Aluno encontrado por userId:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[StudentsClient] Erro ao buscar aluno por userId:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseUrl}/students/user/${userId}`,
      });
      return null;
    }
  }

  async validateStudentActive(studentId: string): Promise<boolean> {
    try {
      const authHeader = this.getAuthHeader();
      const response = await firstValueFrom(
        this.httpService.get<StudentInfo>(
          `${this.baseUrl}/students/${studentId}`,
          {
            headers: authHeader ? { Authorization: authHeader } : {},
          },
        ),
      );
      return response.data.status === 'ACTIVE';
    } catch (error) {
      return false;
    }
  }
}

