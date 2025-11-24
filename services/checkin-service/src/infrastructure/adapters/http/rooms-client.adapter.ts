import { Injectable, Scope } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IRoomsClient, RoomInfo } from '../../../domain/ports/http/rooms-client.port';

@Injectable({ scope: Scope.REQUEST })
export class RoomsClientAdapter implements IRoomsClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly request: any,
  ) {
    this.baseUrl =
      this.configService.get<string>('ROOMS_SERVICE_URL') ||
      'http://localhost:3002/api/v1';
  }

  private getAuthHeader(): string | undefined {
    return this.request?.headers?.authorization;
  }

  async getRoom(roomId: string): Promise<RoomInfo | null> {
    try {
      const authHeader = this.getAuthHeader();
      const response = await firstValueFrom(
        this.httpService.get<RoomInfo>(`${this.baseUrl}/rooms/${roomId}`, {
          headers: authHeader ? { Authorization: authHeader } : {},
        }),
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async validateRoomAvailable(roomId: string): Promise<boolean> {
    try {
      const room = await this.getRoom(roomId);
      return room !== null && room.status === 'ACTIVE';
    } catch (error) {
      return false;
    }
  }
}

