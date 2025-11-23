import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, Clock, Loader2 } from 'lucide-react';
import { roomsService } from '@/services/rooms.service';
import type { Room } from '@/services/rooms.service';

interface RoomSelectorProps {
  onSelectRoom: (roomId: string) => void;
  recentRooms?: string[];
}

export default function RoomSelector({ onSelectRoom, recentRooms = [] }: RoomSelectorProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentRoomsData, setRecentRoomsData] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const allRooms = await roomsService.getRooms();
        // Filtrar apenas salas ativas
        const activeRooms = allRooms.filter(r => r.status === 'ACTIVE');
        setRooms(activeRooms);
        
        // Buscar dados das salas recentes
        if (recentRooms.length > 0) {
          const recent = await Promise.all(
            recentRooms
              .map(async (roomId) => {
                try {
                  return await roomsService.getRoom(roomId);
                } catch {
                  return null;
                }
              })
          );
          setRecentRoomsData(recent.filter((r): r is Room => r !== null && r.status === 'ACTIVE'));
        }
      } catch (error) {
        console.error('Erro ao buscar salas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [recentRooms]);

  const filteredRooms = rooms.filter((room) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      room.roomNumber.toLowerCase().includes(query) ||
      room.type.toLowerCase().includes(query) ||
      (room.description && room.description.toLowerCase().includes(query))
    );
  });

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CLASSROOM: 'Sala de Aula',
      LABORATORY: 'Laboratório',
      AUDITORIUM: 'Auditório',
      STUDY_ROOM: 'Sala de Estudo',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar sala por nome, tipo ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Salas Recentes */}
      {recentRoomsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Salas Recentes
            </CardTitle>
            <CardDescription>
              Salas que você usou recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {recentRoomsData.map((room) => (
                <Button
                  key={room.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start justify-start hover:bg-[#8a0538]/10 hover:border-[#8a0538]"
                  onClick={() => onSelectRoom(room.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Building2 className="h-4 w-4 text-[#8a0538]" />
                    <span className="font-semibold">{room.roomNumber}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {getRoomTypeLabel(room.type)} • {room.capacity} lugares
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Salas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Todas as Salas Disponíveis
          </CardTitle>
          <CardDescription>
            {filteredRooms.length} sala(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRooms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma sala encontrada
            </p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => {
                const isRecent = recentRoomsData.some(r => r.id === room.id);
                return (
                  <Button
                    key={room.id}
                    variant={isRecent ? "default" : "outline"}
                    className={`h-auto p-4 flex flex-col items-start justify-start ${
                      isRecent
                        ? 'bg-[#8a0538] hover:bg-[#6d0429] text-white'
                        : 'hover:bg-[#8a0538]/10 hover:border-[#8a0538]'
                    }`}
                    onClick={() => onSelectRoom(room.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Building2 className={`h-4 w-4 ${isRecent ? 'text-white' : 'text-[#8a0538]'}`} />
                      <span className="font-semibold">{room.roomNumber}</span>
                    </div>
                    <span className={`text-xs mt-1 ${isRecent ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {getRoomTypeLabel(room.type)} • {room.capacity} lugares
                    </span>
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

