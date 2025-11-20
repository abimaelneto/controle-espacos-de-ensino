/**
 * Port: Interface para comunicação com Rooms Service
 */
export interface IRoomsClient {
  getRoom(roomId: string): Promise<RoomInfo | null>;
  validateRoomAvailable(roomId: string): Promise<boolean>;
}

export interface RoomInfo {
  id: string;
  roomNumber: string;
  capacity: number;
  type: string;
  status: 'ACTIVE' | 'INACTIVE';
}

