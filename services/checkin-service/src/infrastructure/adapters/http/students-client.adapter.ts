import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IStudentsClient, StudentInfo } from '../../../domain/ports/http/students-client.port';

@Injectable()
export class StudentsClientAdapter implements IStudentsClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('STUDENTS_SERVICE_URL') ||
      'http://localhost:3001/api/v1';
  }

  async findStudentByCPF(cpf: string): Promise<StudentInfo | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<StudentInfo>(`${this.baseUrl}/students/cpf/${cpf}`),
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async findStudentByMatricula(matricula: string): Promise<StudentInfo | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<StudentInfo>(
          `${this.baseUrl}/students/matricula/${matricula}`,
        ),
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async validateStudentActive(studentId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<StudentInfo>(
          `${this.baseUrl}/students/${studentId}`,
        ),
      );
      return response.data.status === 'ACTIVE';
    } catch (error) {
      return false;
    }
  }
}

