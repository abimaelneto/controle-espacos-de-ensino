import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Room } from '../../../domain/entities/room.entity';

@Injectable()
export class RoomResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((item) => this.transformRoom(item));
        }
        if (data && typeof data === 'object' && 'getId' in data) {
          return this.transformRoom(data);
        }
        return data;
      }),
    );
  }

  private transformRoom(room: Room | any): any {
    if (!room) return null;
    
    // Se já é um objeto simples, retornar como está
    if (room && typeof room === 'object' && !('getId' in room)) {
      return room;
    }

    // Se é uma entidade Room, transformar
    if (room && typeof room === 'object' && 'getId' in room) {
      return {
        id: room.getId(),
        roomNumber: room.getRoomNumber().toString(),
        capacity: room.getCapacity().getValue(),
        type: room.getType().getValue(),
        description: room.getDescription(),
        hasEquipment: room.hasEquipment(),
        status: room.getStatus(),
        createdAt: room.getCreatedAt(),
        updatedAt: room.getUpdatedAt(),
      };
    }

    return room;
  }
}

