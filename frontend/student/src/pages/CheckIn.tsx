import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CheckInForm from '@/components/features/CheckInForm';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Clock, Users } from 'lucide-react';
import { roomsService } from '@/services/rooms.service';

export default function CheckIn() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [roomNumber, setRoomNumber] = useState<string>('');

  useEffect(() => {
    if (roomId) {
      // Buscar informações da sala
      roomsService
        .getRoom(roomId)
        .then((room) => setRoomNumber(room.roomNumber))
        .catch(() => setRoomNumber('N/A'));
    }
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              QR Code inválido ou sala não encontrada
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8a0538]/5 via-white to-[#9654ff]/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header - PUCPR Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#8a0538] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-[#8a0538] mb-1">
                Check-in de Sala
              </h1>
              <p className="text-[#505050] text-sm">PUCPR - Controle de Espaços</p>
            </div>
          </div>
          <p className="text-[#505050]">
            Identifique-se para acessar a sala
          </p>
        </div>

        {/* Informações da Sala - PUCPR Style */}
        <Card className="mb-6 max-w-2xl mx-auto border-2 border-[#8a0538]/20">
          <CardContent className="p-6 bg-gradient-to-r from-[#8a0538]/5 to-[#9654ff]/5">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#8a0538]" />
                <span className="font-semibold text-[#8a0538]">Sala: {roomNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#505050]" />
                <span className="text-sm text-[#505050]">
                  {new Date().toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Check-in */}
        <CheckInForm
          roomId={roomId}
          roomNumber={roomNumber}
          onSuccess={() => {
            // Redirecionar ou mostrar confirmação
            console.log('Check-in realizado com sucesso!');
          }}
        />

        {/* Instruções */}
        <Card className="mt-6 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Como fazer check-in:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
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

