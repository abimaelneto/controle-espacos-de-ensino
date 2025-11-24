/**
 * Port: Interface para comunicação com Students Service
 */
export interface IStudentsClient {
  findStudentByCPF(cpf: string): Promise<StudentInfo | null>;
  findStudentByMatricula(matricula: string): Promise<StudentInfo | null>;
  findStudentByUserId(userId: string): Promise<StudentInfo | null>;
  validateStudentActive(studentId: string): Promise<boolean>;
}

export interface StudentInfo {
  id: string;
  userId: string;
  name: string;
  cpf: string;
  email: string;
  matricula: string;
  status: 'ACTIVE' | 'INACTIVE';
}

