import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRoomsStore } from '@/stores/rooms.store';
import { RoomForm } from '@/components/forms/RoomForm';
import { Loader2, Trash2 } from 'lucide-react';
import type { Room, CreateRoomDto, UpdateRoomDto } from '@/services/rooms.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Rooms() {
  const { rooms, loading, error, fetchRooms, createRoom, updateRoom, deleteRoom } = useRoomsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreate = () => {
    setSelectedRoom(null);
    setFormOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormOpen(true);
  };

  const handleDelete = (room: Room) => {
    setSelectedRoom(room);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRoom) {
      await deleteRoom(selectedRoom.id);
      setDeleteDialogOpen(false);
      setSelectedRoom(null);
    }
  };

  const handleSubmit = async (data: CreateRoomDto | UpdateRoomDto) => {
    if (selectedRoom) {
      await updateRoom(selectedRoom.id, data as UpdateRoomDto);
    } else {
      await createRoom(data as CreateRoomDto);
    }
    fetchRooms();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salas</h1>
          <p className="text-muted-foreground">
            Gerenciamento de salas de ensino
          </p>
        </div>
        <Button onClick={handleCreate}>Nova Sala</Button>
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
                <Card key={room.id} data-testid="room-card">
                  <CardHeader>
                    <CardTitle>{room.roomNumber}</CardTitle>
                    <CardDescription>
                      {room.type} • Capacidade: {room.capacity}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(room)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(room)}>
                        <Trash2 className="h-4 w-4 mr-1" />
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

      <RoomForm
        open={formOpen}
        onOpenChange={setFormOpen}
        room={selectedRoom}
        onSubmit={handleSubmit}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a sala {selectedRoom?.roomNumber}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

