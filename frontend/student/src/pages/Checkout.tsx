import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2, CreditCard, Hash, QrCode, Fingerprint, LogOut, AlertCircle, ArrowLeft, Building2, Clock } from 'lucide-react';
import { checkInService } from '@/services/checkin.service';
import { roomsService } from '@/services/rooms.service';
import { useAuthStore } from '@/stores/auth.store';

type IdentificationMethod = 'CPF' | 'MATRICULA' | 'QR_CODE' | 'BIOMETRIC';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [method, setMethod] = useState<IdentificationMethod>('MATRICULA');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<any>(null);
  const [checkingActive, setCheckingActive] = useState(false);
  const [roomNumber, setRoomNumber] = useState<string>('');

  const methods = [
    { value: 'MATRICULA' as const, label: 'Matrícula', icon: Hash, placeholder: '2024001234' },
    { value: 'CPF' as const, label: 'CPF', icon: CreditCard, placeholder: '000.000.000-00' },
    { value: 'QR_CODE' as const, label: 'QR Code', icon: QrCode, placeholder: 'Código QR' },
    { value: 'BIOMETRIC' as const, label: 'Biometria', icon: Fingerprint, placeholder: 'Biometria' },
  ];

  // Verificar check-in ativo ao mudar método ou valor
  useEffect(() => {
    if (value && value.trim().length > 0) {
      checkActiveAttendance();
    } else {
      setActiveAttendance(null);
      setRoomNumber('');
    }
  }, [method, value]);

  const checkActiveAttendance = async () => {
    if (!value || value.trim().length === 0) {
      setActiveAttendance(null);
      return;
    }

    setCheckingActive(true);
    try {
      const active = await checkInService.getActiveAttendance(method, value.trim());
      setActiveAttendance(active);
      if (active && active.roomId) {
        try {
          const room = await roomsService.getRoom(active.roomId);
          setRoomNumber(room.roomNumber || 'N/A');
        } catch {
          setRoomNumber('N/A');
        }
      } else {
        setRoomNumber('');
      }
    } catch (error) {
      console.error('Erro ao verificar check-in ativo:', error);
      setActiveAttendance(null);
      setRoomNumber('');
    } finally {
      setCheckingActive(false);
    }
  };

  const formatInput = (method: IdentificationMethod, value: string): string => {
    if (method === 'CPF') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 11) {
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return value;
    }
    if (method === 'MATRICULA') {
      return value.replace(/\D/g, '').slice(0, 10);
    }
    return value;
  };

  const validateInput = (method: IdentificationMethod, value: string): boolean => {
    if (!value || value.trim().length === 0) return false;
    
    if (method === 'CPF') {
      const numbers = value.replace(/\D/g, '');
      return numbers.length === 11;
    }
    if (method === 'MATRICULA') {
      const numbers = value.replace(/\D/g, '');
      return numbers.length >= 8 && numbers.length <= 10;
    }
    if (method === 'QR_CODE' || method === 'BIOMETRIC') {
      return value.trim().length > 0;
    }
    return false;
  };

  const handleCheckout = async () => {
    if (!value || !validateInput(method, value)) {
      setError('Por favor, informe seus dados corretamente');
      return;
    }

    if (!activeAttendance) {
      setError('Você não possui um check-in ativo para fazer checkout');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('[Checkout] Enviando checkout request:', { 
        identificationMethod: method, 
        identificationValue: value.trim() 
      });
      const response = await checkInService.performCheckOut({
        identificationMethod: method,
        identificationValue: value.trim(),
      });

      if (response.success) {
        setSuccess(true);
        setActiveAttendance(null);
        setRoomNumber('');
        setValue('');
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(response.message || 'Erro ao realizar checkout');
      }
    } catch (err: any) {
      console.error('[Checkout] Erro no checkout:', err.response?.data || err);
      setError(err.response?.data?.message || 'Erro ao realizar checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(method, e.target.value);
    setValue(formatted);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8a0538]/5 via-white to-[#9654ff]/5">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header - PUCPR Branding */}
        <div className="flex justify-between items-start mb-4 sm:mb-8">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8a0538] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl sm:text-2xl">P</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl sm:text-4xl font-bold text-[#8a0538] mb-1">
                  Check-out de Sala
                </h1>
                <p className="text-[#505050] text-xs sm:text-sm">PUCPR - Controle de Espaços</p>
              </div>
            </div>
            <p className="text-[#505050] text-sm sm:text-base">
              Identifique-se para realizar o checkout
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
              onClick={() => navigate('/checkin')}
              className="text-[#8a0538] border-[#8a0538] hover:bg-[#8a0538] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        {/* Informações do Check-in Ativo */}
        {activeAttendance && (
          <Card className="mb-4 sm:mb-6 max-w-2xl mx-auto border-2 border-blue-500 bg-blue-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-2">
                    Check-in Ativo Encontrado
                  </p>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Sala: <strong>{roomNumber || 'N/A'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Check-in realizado em:{' '}
                        <strong>
                          {new Date(activeAttendance.checkInTime).toLocaleString('pt-BR')}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de Sucesso */}
        {success && (
          <Card className="mb-4 sm:mb-6 max-w-2xl mx-auto border-2 border-green-500 bg-green-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">
                    Check-out realizado com sucesso!
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    Você pode fazer um novo check-in quando necessário.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <Card className="mb-4 sm:mb-6 max-w-2xl mx-auto border-2 border-red-500 bg-red-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-900">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Checkout */}
        <Card className="w-full max-w-2xl mx-auto border-2 border-[#8a0538]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#8a0538] to-[#6d0429] text-white rounded-t-lg">
            <CardTitle className="text-white">Check-out de Sala</CardTitle>
            <CardDescription className="text-white/90">
              Escolha o método de identificação e informe seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
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
                <Label htmlFor="identification-value">
                  {methods.find((m) => m.value === method)?.label}
                </Label>
                <Input
                  id="identification-value"
                  type="text"
                  value={value}
                  onChange={handleInputChange}
                  placeholder={methods.find((m) => m.value === method)?.placeholder}
                  disabled={loading}
                  className="text-lg"
                />
                {checkingActive && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando check-in ativo...
                  </p>
                )}
              </div>

              {/* Botão de Checkout */}
              <Button
                type="button"
                onClick={handleCheckout}
                disabled={loading || !value || !validateInput(method, value) || !activeAttendance}
                className="w-full bg-[#8a0538] hover:bg-[#6d0429] text-white h-12 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processando Check-out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5 mr-2" />
                    Realizar Check-out
                  </>
                )}
              </Button>

              {!activeAttendance && value && validateInput(method, value) && !checkingActive && (
                <Card className="border-2 border-orange-500 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-orange-900 mb-1">
                          Nenhum check-in ativo encontrado
                        </p>
                        <p className="text-sm text-orange-800">
                          Não foi encontrado um check-in ativo com os dados informados.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mt-4 sm:mt-6 max-w-2xl mx-auto">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Como fazer check-out:</h3>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>Escolha o método de identificação (Matrícula, CPF, QR Code ou Biometria)</li>
              <li>Informe seus dados conforme solicitado</li>
              <li>O sistema verificará se você possui um check-in ativo</li>
              <li>Confirme que os dados estão corretos</li>
              <li>Clique em "Realizar Check-out"</li>
              <li>Aguarde a confirmação do sistema</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

