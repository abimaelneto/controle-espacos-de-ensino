import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRoomsStore } from '@/stores/rooms.store';
import { Loader2 } from 'lucide-react';

export default function Rooms() {
  const { rooms, loading, error, fetchRooms } = useRoomsStore();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salas</h1>
          <p className="text-muted-foreground">
            Gerenciamento de salas de ensino
          </p>
        </div>
        <Button>Nova Sala</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Salas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as salas disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : rooms.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma sala cadastrada</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card key={room.id}>
                  <CardHeader>
                    <CardTitle>{room.roomNumber}</CardTitle>
                    <CardDescription>
                      {room.type} • Capacidade: {room.capacity}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1">
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

