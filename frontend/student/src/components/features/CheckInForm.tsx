import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2, CreditCard, Hash, QrCode, Fingerprint, LogOut, AlertCircle } from 'lucide-react';
import { checkInService } from '@/services/checkin.service';
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

  // Verificar check-in ativo quando o valor de identificação mudar
  useEffect(() => {
    const checkActiveAttendance = async () => {
      if (!value || !validateInput(method, value)) {
        setActiveAttendance(null);
        return;
      }

      setCheckingActive(true);
      try {
        const active = await checkInService.getActiveAttendance(method, value);
        setActiveAttendance(active);
        
        // Buscar número da sala atual se houver check-in ativo
        if (active && active.roomId) {
          try {
            const room = await roomsService.getRoom(active.roomId);
            setCurrentRoomNumber(room.roomNumber || 'N/A');
          } catch {
            setCurrentRoomNumber('N/A');
          }
        }
      } catch (err) {
        setActiveAttendance(null);
      } finally {
        setCheckingActive(false);
      }
    };

    // Debounce para evitar muitas chamadas
    const timeoutId = setTimeout(checkActiveAttendance, 500);
    return () => clearTimeout(timeoutId);
  }, [value, method]);

  const handleCheckout = async () => {
    if (!value || !validateInput(method, value)) {
      setError('Por favor, informe seus dados primeiro');
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const response = await checkInService.performCheckOut({
        identificationMethod: method,
        identificationValue: value,
      });

      if (response.success) {
        setActiveAttendance(null);
        setCurrentRoomNumber('');
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError(response.message || 'Erro ao realizar checkout');
      }
    } catch (err: any) {
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
      // Validar formato antes de enviar
      if (!validateInput(method, value)) {
        setError('Formato inválido. Verifique os dados informados.');
        setLoading(false);
        return;
      }

      // Se há check-in ativo em outra sala, não permitir
      if (activeAttendance && activeAttendance.roomId !== roomId) {
        setError('Você já possui um check-in ativo em outra sala. Faça checkout primeiro.');
        setLoading(false);
        return;
      }

      const request: CheckInRequest = {
        studentId: '', // Será resolvido no backend
        roomId,
        identificationMethod: method,
        identificationValue: value,
      };

      const response = await checkInService.performCheckIn(request);

      if (response.success) {
        setSuccess(true);
        // Não limpar o value imediatamente para permitir checkout
        // setValue('');
        
        // Atualizar check-in ativo após sucesso
        setTimeout(async () => {
          if (value && validateInput(method, value)) {
            try {
              const active = await checkInService.getActiveAttendance(method, value);
              setActiveAttendance(active);
              if (active && active.roomId) {
                try {
                  const room = await roomsService.getRoom(active.roomId);
                  setCurrentRoomNumber(room.roomNumber || 'N/A');
                } catch {
                  setCurrentRoomNumber('N/A');
                }
              }
            } catch {
              // Ignorar erro
            }
          }
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
        return true; // Validação no backend
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

  const isInDifferentRoom = activeAttendance && activeAttendance.roomId !== roomId;
  const isInSameRoom = activeAttendance && activeAttendance.roomId === roomId;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Alerta de Check-in Ativo em Outra Sala */}
      {isInDifferentRoom && (
        <Card className="border-2 border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900 mb-1">
                  Você já está em outra sala
                </p>
                <p className="text-sm text-orange-800 mb-3">
                  Você possui um check-in ativo na sala <strong>{currentRoomNumber || 'N/A'}</strong>.
                  Faça checkout primeiro para fazer check-in nesta sala.
                </p>
                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !value || !validateInput(method, value)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Check-in Ativo na Mesma Sala */}
      {isInSameRoom && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">
                  Você já está nesta sala
                </p>
                <p className="text-sm text-blue-800 mb-3">
                  Você já possui um check-in ativo nesta sala. Não é necessário fazer check-in novamente.
                </p>
                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !value || !validateInput(method, value)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
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
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full border-2 border-[#8a0538]/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#8a0538] to-[#6d0429] text-white rounded-t-lg">
          <CardTitle className="text-white">Check-in - Sala {roomNumber}</CardTitle>
          <CardDescription className="text-white/90">
            Escolha o método de identificação e informe seus dados
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
                  const isSelected = method === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setMethod(m.value);
                        setValue('');
                        setError(null);
                        setActiveAttendance(null);
                      }}
                      className={`
                        flex items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all
                        ${isSelected
                          ? 'border-[#8a0538] bg-[#8a0538]/10 text-[#8a0538]'
                          : 'border-gray-200 hover:border-[#8a0538]/50 text-[#505050]'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo de Entrada */}
            <div className="space-y-2">
              <Label htmlFor="identification">
                {method === 'CPF' && 'CPF (apenas números)'}
                {method === 'MATRICULA' && 'Matrícula'}
                {method === 'QR_CODE' && 'Código QR ou escaneie'}
                {method === 'BIOMETRIC' && 'Toque no sensor biométrico'}
              </Label>
              {method === 'QR_CODE' ? (
                <div className="space-y-2">
                  <Input
                    id="identification"
                    placeholder="Cole o código QR ou use a câmera"
                    value={value}
                    onChange={handleInputChange}
                    disabled={loading || checkoutLoading}
                    className="text-base sm:text-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      alert('Scanner de QR Code será implementado');
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Escanear QR Code
                  </Button>
                </div>
              ) : method === 'BIOMETRIC' ? (
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-lg">
                  <Fingerprint className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center">
                    Toque no sensor biométrico para identificação
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      alert('Integração com sensor biométrico será implementada');
                    }}
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
                  disabled={loading || checkoutLoading}
                  maxLength={method === 'CPF' ? 11 : undefined}
                  className="text-base sm:text-lg text-center font-mono"
                />
              )}
            </div>

            {/* Feedback de Validação */}
            {value && !error && !success && checkingActive && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando check-in ativo...</span>
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
                  <span className="font-semibold text-sm sm:text-base">Check-in realizado com sucesso!</span>
                </div>
              </div>
            )}

            {/* Botão de Submit */}
            <Button
              type="submit"
              className="w-full bg-[#8a0538] hover:bg-[#6d0429] text-white"
              size="lg"
              disabled={loading || checkoutLoading || !value || !validateInput(method, value) || isInDifferentRoom || isInSameRoom}
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
