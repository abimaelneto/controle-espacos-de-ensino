import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CheckInForm from '@/components/features/CheckInForm';
import RoomSelector from '@/components/features/RoomSelector';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Clock, ArrowLeft, LogOut } from 'lucide-react';
import { roomsService } from '@/services/rooms.service';
import { recentRoomsStorage } from '@/utils/localStorage';
import { useAuthStore } from '@/stores/auth.store';

export default function CheckIn() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [roomData, setRoomData] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (roomId) {
      // Buscar informações completas da sala
      roomsService
        .getRoom(roomId)
        .then((room) => {
          setRoomNumber(room.roomNumber || 'N/A');
          setRoomData(room);
        })
        .catch((error) => {
          console.error('Erro ao buscar sala:', error);
          setRoomNumber('N/A');
          setRoomData(null);
        });
    }
  }, [roomId]);

  const handleSelectRoom = (selectedRoomId: string) => {
    // Atualizar URL com novo roomId
    setSearchParams({ roomId: selectedRoomId });
    // Salvar nas salas recentes
    roomsService.getRoom(selectedRoomId).then((room) => {
      recentRoomsStorage.addRoom(room.id, room.roomNumber);
    });
  };

  // Se não há roomId, mostrar seletor de salas
  if (!roomId) {
    const recentRoomIds = recentRoomsStorage.getRecentRoomIds();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8a0538]/5 via-white to-[#9654ff]/5">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Header com Logout */}
          <div className="flex justify-between items-start mb-4 sm:mb-8">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8a0538] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl sm:text-2xl">P</span>
                </div>
                <div className="text-left">
                  <h1 className="text-2xl sm:text-4xl font-bold text-[#8a0538] mb-1">
                    Check-in de Sala
                  </h1>
                  <p className="text-[#505050] text-xs sm:text-sm">PUCPR - Controle de Espaços</p>
                </div>
              </div>
              <p className="text-[#505050] text-sm sm:text-base">
                Selecione a sala para fazer check-in
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {user && (
                <div className="text-right text-xs sm:text-sm text-[#505050] mb-2">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-[#505050]/70">{user.role}</div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-[#8a0538] border-[#8a0538] hover:bg-[#8a0538] hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Seletor de Salas */}
          <RoomSelector
            onSelectRoom={handleSelectRoom}
            recentRooms={recentRoomIds}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8a0538]/5 via-white to-[#9654ff]/5">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header - PUCPR Branding com Logout */}
        <div className="flex justify-between items-start mb-4 sm:mb-8">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8a0538] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl sm:text-2xl">P</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl sm:text-4xl font-bold text-[#8a0538] mb-1">
                  Check-in de Sala
                </h1>
                <p className="text-[#505050] text-xs sm:text-sm">PUCPR - Controle de Espaços</p>
              </div>
            </div>
            <p className="text-[#505050] text-sm sm:text-base">
              Identifique-se para acessar a sala
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {user && (
              <div className="text-right text-xs sm:text-sm text-[#505050] mb-2">
                <div className="font-medium">{user.email}</div>
                <div className="text-[#505050]/70">{user.role}</div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-[#8a0538] border-[#8a0538] hover:bg-[#8a0538] hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Botões de Navegação */}
        <div className="max-w-2xl mx-auto mb-4">
          <Button
            variant="outline"
            onClick={() => setSearchParams({})}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Escolher Outra Sala
          </Button>
        </div>

        {/* Informações da Sala - PUCPR Style */}
        <Card className="mb-4 sm:mb-6 max-w-2xl mx-auto border-2 border-[#8a0538]/20">
          <CardContent className="p-4 sm:p-6 bg-gradient-to-r from-[#8a0538]/5 to-[#9654ff]/5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#8a0538]" />
                <span className="font-semibold text-sm sm:text-base text-[#8a0538]">
                  Sala: {roomData?.roomNumber || roomNumber || 'Carregando...'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#505050]" />
                <span className="text-xs sm:text-sm text-[#505050]">
                  {new Date().toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Check-in */}
        <CheckInForm
          roomId={roomId}
          roomNumber={roomNumber || roomData?.roomNumber || 'N/A'}
          onSuccess={() => {
            // Salvar nas salas recentes
            if (roomData) {
              recentRoomsStorage.addRoom(roomData.id, roomData.roomNumber);
            }
            console.log('Check-in realizado com sucesso!');
          }}
        />

        {/* Instruções */}
        <Card className="mt-4 sm:mt-6 max-w-2xl mx-auto">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Como fazer check-in:</h3>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>Escolha o método de identificação (Matrícula, CPF, QR Code ou Biometria)</li>
              <li>Informe seus dados conforme solicitado</li>
              <li>Confirme que os dados estão corretos</li>
              <li>Clique em "Realizar Check-in"</li>
              <li>Aguarde a confirmação do sistema</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

