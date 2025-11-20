import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import type { Room, CreateRoomDto, UpdateRoomDto } from '@/services/rooms.service';

interface RoomFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  onSubmit: (data: CreateRoomDto | UpdateRoomDto) => Promise<void>;
}

const ROOM_TYPES = [
  { value: 'CLASSROOM', label: 'Sala de Aula' },
  { value: 'LABORATORY', label: 'Laboratório' },
  { value: 'AUDITORIUM', label: 'Auditório' },
  { value: 'STUDY_ROOM', label: 'Sala de Estudo' },
];

export function RoomForm({ open, onOpenChange, room, onSubmit }: RoomFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateRoomDto>({
    roomNumber: '',
    type: 'CLASSROOM',
    capacity: 30,
    hasEquipment: false,
  });

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        type: room.type,
        capacity: room.capacity,
        hasEquipment: room.hasEquipment,
      });
    } else {
      setFormData({
        roomNumber: '',
        type: 'CLASSROOM',
        capacity: 30,
        hasEquipment: false,
      });
    }
    setErrors({});
  }, [room, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Número da sala é obrigatório';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacidade deve ser maior que zero';
    } else if (formData.capacity > 10000) {
      newErrors.capacity = 'Capacidade não pode ser maior que 10000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (room) {
        await onSubmit({
          type: formData.type,
          capacity: formData.capacity,
          hasEquipment: formData.hasEquipment,
        });
      } else {
        await onSubmit(formData);
      }
      onOpenChange(false);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao salvar sala' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{room ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {!room && (
              <FormField>
                <FormLabel htmlFor="roomNumber">Número da Sala *</FormLabel>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="Ex: A101"
                  disabled={loading}
                />
                {errors.roomNumber && <FormMessage>{errors.roomNumber}</FormMessage>}
              </FormField>
            )}

            <FormField>
              <FormLabel htmlFor="type">Tipo *</FormLabel>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={loading}
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField>
              <FormLabel htmlFor="capacity">Capacidade *</FormLabel>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="10000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
              {errors.capacity && <FormMessage>{errors.capacity}</FormMessage>}
            </FormField>

            <FormField>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasEquipment"
                  checked={formData.hasEquipment}
                  onChange={(e) => setFormData({ ...formData, hasEquipment: e.target.checked })}
                  disabled={loading}
                />
                <Label htmlFor="hasEquipment" className="cursor-pointer">
                  Possui equipamentos
                </Label>
              </div>
            </FormField>

            {errors.submit && <FormMessage>{errors.submit}</FormMessage>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

