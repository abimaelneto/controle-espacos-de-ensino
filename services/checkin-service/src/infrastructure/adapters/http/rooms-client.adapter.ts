import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IRoomsClient, RoomInfo } from '../../../domain/ports/http/rooms-client.port';

@Injectable()
export class RoomsClientAdapter implements IRoomsClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('ROOMS_SERVICE_URL') ||
      'http://localhost:3002/api/v1';
  }

  async getRoom(roomId: string): Promise<RoomInfo | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<RoomInfo>(`${this.baseUrl}/rooms/${roomId}`),
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

