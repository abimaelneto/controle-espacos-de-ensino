export interface CheckInRequest {
  studentId: string;
  roomId: string;
  identificationMethod: 'CPF' | 'MATRICULA' | 'QR_CODE' | 'BIOMETRIC';
  identificationValue: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  checkInId?: string;
  timestamp?: Date;
  room?: {
    id: string;
    roomNumber: string;
    capacity: number;
  };
  student?: {
    id: string;
    name: string;
    matricula: string;
  };
}

export interface CheckInHistory {
  id: string;
  roomId: string;
  roomNumber: string;
  studentId: string;
  studentName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'ACTIVE' | 'COMPLETED';
}

