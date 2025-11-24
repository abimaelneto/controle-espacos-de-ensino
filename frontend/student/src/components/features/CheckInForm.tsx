import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2, CreditCard, Hash, QrCode, Fingerprint, LogOut } from 'lucide-react';
import { checkInService, type CheckOutRequest } from '@/services/checkin.service';
import type { CheckInRequest } from '@/types/checkin';
import { roomsService } from '@/services/rooms.service';

type IdentificationMethod = 'CPF' | 'MATRICULA' | 'QR_CODE' | 'BIOMETRIC';

interface CheckInFormProps {
  roomId: string;
  roomNumber: string;
  onSuccess?: () => void;
}

export default function CheckInForm({ roomId, roomNumber, onSuccess }: CheckInFormProps) {
  const [method, setMethod] = useState<IdentificationMethod>('MATRICULA');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<any>(null);
  const [checkingActive, setCheckingActive] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [currentRoomNumber, setCurrentRoomNumber] = useState<string>('');

  const methods = [
    { value: 'MATRICULA', label: 'Matrícula', icon: Hash },
    { value: 'CPF', label: 'CPF', icon: CreditCard },
    { value: 'QR_CODE', label: 'QR Code', icon: QrCode },
    { value: 'BIOMETRIC', label: 'Biometria', icon: Fingerprint },
  ] as const;

  // Função para buscar check-in ativo
  const refreshActiveAttendance = async () => {
    setCheckingActive(true);
    try {
      const active = await checkInService.getMyActiveAttendance();
      setActiveAttendance(active);
      
      if (active && active.roomId) {
        try {
          const room = await roomsService.getRoom(active.roomId);
          setCurrentRoomNumber(room.roomNumber || 'N/A');
        } catch {
          setCurrentRoomNumber('N/A');
        }
      } else {
        setCurrentRoomNumber('');
      }
    } catch (err) {
      console.error('[CheckInForm] Erro ao buscar check-in ativo:', err);
      setActiveAttendance(null);
      setCurrentRoomNumber('');
    } finally {
      setCheckingActive(false);
    }
  };

  // Buscar check-in ativo ao montar e quando mudar de sala
  useEffect(() => {
    refreshActiveAttendance();
  }, [roomId]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);

    try {
      const hasValidInput = value && validateInput(method, value);
      const checkoutRequest: CheckOutRequest = {
        identificationMethod: hasValidInput ? method : 'MATRICULA',
        identificationValue: hasValidInput ? value.trim() : undefined,
      };
      
      const response = await checkInService.performCheckOut(checkoutRequest);

      if (response.success) {
        setSuccess(true);
        setValue('');
        // Atualizar imediatamente
        await refreshActiveAttendance();
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError(response.message || 'Erro ao realizar checkout');
      }
    } catch (err: any) {
      console.error('[CheckInForm] Erro no checkout:', err);
      setError(err.response?.data?.message || 'Erro ao realizar checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!validateInput(method, value)) {
        setError('Formato inválido. Verifique os dados informados.');
        setLoading(false);
        return;
      }

      // Se há check-in ativo, não permitir novo check-in
      if (activeAttendance) {
        setError('Você já possui um check-in ativo. Faça checkout primeiro.');
        setLoading(false);
        return;
      }

      const request: CheckInRequest = {
        roomId,
        identificationMethod: method,
        identificationValue: value.trim(),
      };
      
      const response = await checkInService.performCheckIn(request);

      if (response.success) {
        setSuccess(true);
        // Atualizar imediatamente após check-in
        await refreshActiveAttendance();
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 2000);
      } else {
        setError(response.message || 'Erro ao realizar check-in');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar check-in');
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (method: IdentificationMethod, val: string): boolean => {
    const trimmed = val.replace(/\s/g, '');
    
    switch (method) {
      case 'CPF':
        return /^\d{11}$/.test(trimmed);
      case 'MATRICULA':
        return trimmed.length >= 5 && trimmed.length <= 16;
      case 'QR_CODE':
        return trimmed.length > 0;
      case 'BIOMETRIC':
        return true;
      default:
        return false;
    }
  };

  const formatInput = (method: IdentificationMethod, val: string) => {
    if (method === 'CPF') {
      return val.replace(/\D/g, '').slice(0, 11);
    }
    return val;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(method, e.target.value);
    setValue(formatted);
    setError(null);
  };

  const isInSameRoom = activeAttendance && activeAttendance.roomId === roomId;
  const isInDifferentRoom = activeAttendance && activeAttendance.roomId !== roomId;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Botão de Checkout - Sempre visível quando há check-in ativo */}
      {activeAttendance && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900">
                    Check-in ativo
                  </p>
                  <p className="text-sm text-blue-800">
                    {isInSameRoom 
                      ? `Você está na sala ${roomNumber}`
                      : `Você está na sala ${currentRoomNumber || 'N/A'}`
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Fazer Checkout
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aviso se está em outra sala */}
      {isInDifferentRoom && (
        <Card className="border-2 border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-sm text-orange-800">
              ⚠️ Você possui um check-in ativo em outra sala. Faça checkout primeiro para fazer check-in nesta sala.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="w-full border-2 border-[#8a0538]/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#8a0538] to-[#6d0429] text-white rounded-t-lg">
          <CardTitle className="text-white">Check-in - Sala {roomNumber}</CardTitle>
          <CardDescription className="text-white/90">
            {activeAttendance 
              ? 'Você já possui um check-in ativo. Use o botão acima para fazer checkout.'
              : 'Escolha o método de identificação e informe seus dados'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Método de Identificação */}
            <div className="space-y-2">
              <Label>Método de Identificação</Label>
              <div className="grid grid-cols-2 gap-2">
                {methods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <Button
                      key={m.value}
                      type="button"
                      variant={method === m.value ? 'default' : 'outline'}
                      onClick={() => {
                        setMethod(m.value);
                        setValue('');
                        setError(null);
                      }}
                      disabled={!!activeAttendance}
                      className={`flex items-center gap-2 ${
                        method === m.value
                          ? 'bg-[#8a0538] text-white hover:bg-[#6d0429]'
                          : ''
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {m.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Campo de Valor */}
            <div className="space-y-2">
              <Label htmlFor="identification">
                {methods.find((m) => m.value === method)?.label}
              </Label>
              {method === 'BIOMETRIC' ? (
                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                  <Fingerprint className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Integração com sensor biométrico será implementada
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      alert('Integração com sensor biométrico será implementada');
                    }}
                    disabled={!!activeAttendance}
                  >
                    Iniciar Leitura Biométrica
                  </Button>
                </div>
              ) : (
                <Input
                  id="identification"
                  type={method === 'CPF' ? 'tel' : 'text'}
                  placeholder={
                    method === 'CPF'
                      ? '00000000000'
                      : 'Digite sua matrícula'
                  }
                  value={value}
                  onChange={handleInputChange}
                  disabled={loading || checkoutLoading || !!activeAttendance}
                  maxLength={method === 'CPF' ? 11 : undefined}
                  className="text-base sm:text-lg text-center font-mono"
                />
              )}
            </div>

            {/* Feedback de Validação */}
            {value && !error && !success && checkingActive && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando...</span>
              </div>
            )}

            {value && !error && !success && !checkingActive && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {validateInput(method, value) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Formato válido</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-yellow-500" />
                    <span>Verifique o formato</span>
                  </>
                )}
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="p-3 sm:p-4 bg-[#ff0040]/10 border-2 border-[#ff0040] rounded-lg">
                <div className="flex items-center gap-2 text-[#ff0040]">
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{error}</span>
                </div>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {success && (
              <div className="p-3 sm:p-4 bg-[#8a0538]/10 border-2 border-[#8a0538] rounded-lg">
                <div className="flex items-center gap-2 text-[#8a0538]">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">
                    {activeAttendance ? 'Check-out realizado com sucesso!' : 'Check-in realizado com sucesso!'}
                  </span>
                </div>
              </div>
            )}

            {/* Botão de Submit */}
            <Button
              type="submit"
              className="w-full bg-[#8a0538] hover:bg-[#6d0429] text-white"
              size="lg"
              disabled={loading || checkoutLoading || !value || !validateInput(method, value) || !!activeAttendance}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Realizar Check-in'
              )}
            </Button>
          </form>

          {/* Informações de Segurança */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Seus dados são criptografados e utilizados apenas para validação de identidade.
              O sistema verifica sua matrícula/CPF no banco de dados antes de permitir o check-in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
