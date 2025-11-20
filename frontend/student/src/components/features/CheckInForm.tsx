import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2, CreditCard, Hash, QrCode, Fingerprint } from 'lucide-react';
import { checkInService } from '@/services/checkin.service';
import type { CheckInRequest } from '@/types/checkin';

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

  const methods = [
    { value: 'MATRICULA', label: 'Matrícula', icon: Hash },
    { value: 'CPF', label: 'CPF', icon: CreditCard },
    { value: 'QR_CODE', label: 'QR Code', icon: QrCode },
    { value: 'BIOMETRIC', label: 'Biometria', icon: Fingerprint },
  ] as const;

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

      const request: CheckInRequest = {
        studentId: '', // Será resolvido no backend
        roomId,
        identificationMethod: method,
        identificationValue: value,
      };

      const response = await checkInService.performCheckIn(request);

      if (response.success) {
        setSuccess(true);
        setValue('');
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

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-[#8a0538]/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#8a0538] to-[#6d0429] text-white rounded-t-lg">
        <CardTitle className="text-white">Check-in - Sala {roomNumber}</CardTitle>
        <CardDescription className="text-white/90">
          Escolha o método de identificação e informe seus dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    }}
                    className={`
                      flex items-center gap-2 p-4 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-[#8a0538] bg-[#8a0538]/10 text-[#8a0538]'
                        : 'border-gray-200 hover:border-[#8a0538]/50 text-[#505050]'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{m.label}</span>
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
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Abrir scanner de QR Code
                    alert('Scanner de QR Code será implementado');
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR Code
                </Button>
              </div>
            ) : method === 'BIOMETRIC' ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <Fingerprint className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  Toque no sensor biométrico para identificação
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    // Simular leitura biométrica
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
                disabled={loading}
                maxLength={method === 'CPF' ? 11 : undefined}
                className="text-lg text-center font-mono"
              />
            )}
          </div>

          {/* Feedback de Validação */}
          {value && !error && !success && (
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

          {/* Mensagem de Erro - PUCPR Style */}
          {error && (
            <div className="p-4 bg-[#ff0040]/10 border-2 border-[#ff0040] rounded-lg">
              <div className="flex items-center gap-2 text-[#ff0040]">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Mensagem de Sucesso - PUCPR Style */}
          {success && (
            <div className="p-4 bg-[#8a0538]/10 border-2 border-[#8a0538] rounded-lg">
              <div className="flex items-center gap-2 text-[#8a0538]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Check-in realizado com sucesso!</span>
              </div>
            </div>
          )}

          {/* Botão de Submit - PUCPR Style */}
          <Button
            type="submit"
            className="w-full bg-[#8a0538] hover:bg-[#6d0429] text-white"
            size="lg"
            disabled={loading || !value || !validateInput(method, value)}
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
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Seus dados são criptografados e utilizados apenas para validação de identidade.
            O sistema verifica sua matrícula/CPF no banco de dados antes de permitir o check-in.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

