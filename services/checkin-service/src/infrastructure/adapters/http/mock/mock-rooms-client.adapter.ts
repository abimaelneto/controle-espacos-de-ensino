import { IRoomsClient, RoomInfo } from '../../../../domain/ports/http/rooms-client.port';

export class MockRoomsClientAdapter implements IRoomsClient {
  async getRoom(roomId: string): Promise<RoomInfo | null> {
    if (!roomId) {
      return null;
    }

    return {
      id: roomId,
      roomNumber: roomId.replace(/-/g, ' ').toUpperCase(),
      capacity: 100000,
      type: 'LABORATORY',
      status: 'ACTIVE',
    };
  }

  async validateRoomAvailable(roomId: string): Promise<boolean> {
    return !!roomId;
  }
}


