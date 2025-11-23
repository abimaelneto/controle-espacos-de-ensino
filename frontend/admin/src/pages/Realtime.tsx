import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsService, RealtimeRoomOccupancy } from '@/services/analytics.service';
import { roomsService } from '@/services/rooms.service';
import { realtimeService } from '@/services/realtime.service';
import { Building2, Users, TrendingUp, Loader2, Wifi, WifiOff } from 'lucide-react';
import { BarChart } from '@/components/charts/BarChart';

const POLLING_INTERVAL_MS = 5000; // 5 segundos - suficiente para gestão

export default function Realtime() {
  const [occupancy, setOccupancy] = useState<RealtimeRoomOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar salas
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await roomsService.getAll();
        setRooms(roomsData);
      } catch (err) {
        console.error('Erro ao carregar salas:', err);
      }
    };
    
    fetchRooms();
  }, []);

  // Função para buscar dados
  const fetchData = async () => {
    try {
      setError(null);
      const data = await analyticsService.getRealtimeOccupancy();
      
      // Enriquecer com dados da sala
      const roomMap = new Map(rooms.map((r) => [r.id, r]));
      const enrichedData = data.map((occ) => {
        const room = roomMap.get(occ.roomId);
        return {
          ...occ,
          roomNumber: room?.roomNumber || `Sala ${occ.roomId.substring(0, 8)}`,
          capacity: room?.capacity || occ.capacity,
        };
      });
      
      // Ordenar por ocupação (mais ocupadas primeiro)
      enrichedData.sort((a, b) => b.currentOccupancy - a.currentOccupancy);
      
      setOccupancy(enrichedData);
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar dados em tempo real:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados em tempo real');
      setLoading(false);
    }
  };

  // Configurar WebSocket e polling
  useEffect(() => {
    // Conectar ao WebSocket
    realtimeService.connect();
    setIsWebSocketConnected(realtimeService.isConnected());

    // Carregar dados iniciais
    fetchData();

    // Escutar eventos de check-in/checkout em tempo real
    const handleCheckIn = () => {
      fetchData();
    };

    const handleOccupancyUpdate = () => {
      fetchData();
    };

    realtimeService.on('checkin', handleCheckIn);
    realtimeService.on('checkout', handleCheckIn);
    realtimeService.on('room:checkin', handleOccupancyUpdate);
    realtimeService.on('room:checkout', handleOccupancyUpdate);
    realtimeService.on('occupancy:update', handleOccupancyUpdate);

    // Polling como backup (sempre ativo)
    intervalRef.current = setInterval(() => {
      fetchData();
    }, POLLING_INTERVAL_MS);

    // Verificar conexão periodicamente
    const connectionCheck = setInterval(() => {
      const connected = realtimeService.isConnected();
      setIsWebSocketConnected(connected);
    }, 2000);

    return () => {
      realtimeService.off('checkin', handleCheckIn);
      realtimeService.off('checkout', handleCheckIn);
      realtimeService.off('room:checkin', handleOccupancyUpdate);
      realtimeService.off('room:checkout', handleOccupancyUpdate);
      realtimeService.off('occupancy:update', handleOccupancyUpdate);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(connectionCheck);
    };
  }, [rooms]);

  // Calcular estatísticas gerais
  const totalOccupancy = occupancy.reduce((sum, occ) => sum + occ.currentOccupancy, 0);
  const totalRooms = occupancy.length;
  const activeRooms = occupancy.filter((occ) => occ.currentOccupancy > 0).length;
  const occupancyRate = totalRooms > 0 ? (activeRooms / totalRooms) * 100 : 0;
  
  // Top 5 salas mais ocupadas
  const topOccupiedRooms = occupancy
    .filter(occ => occ.currentOccupancy > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monitoramento em Tempo Real</h1>
        <p className="text-muted-foreground">
          Visão executiva da ocupação das salas de ensino
        </p>
      </div>

      {/* Status de Conexão */}
      <Card className={isWebSocketConnected ? 'border-green-500' : 'border-yellow-500'}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {isWebSocketConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  Conectado - Atualizações em tempo real
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">
                  Usando polling (atualização a cada 5s)
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo Executivo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salas Ocupadas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRooms}</div>
            <p className="text-xs text-muted-foreground">
              de {totalRooms} salas disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupação Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOccupancy}</div>
            <p className="text-xs text-muted-foreground">
              Pessoas nas salas agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Salas em uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins (1h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {occupancy.reduce((sum, occ) => sum + occ.checkInsLastHour, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Última hora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Salas Mais Ocupadas */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Salas Mais Ocupadas</CardTitle>
              <CardDescription>
                Salas com maior ocupação no momento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topOccupiedRooms.length > 0 ? (
                <BarChart
                  data={topOccupiedRooms.map((occ) => ({
                    name: occ.roomNumber,
                    value: occ.currentOccupancy,
                  }))}
                  xKey="name"
                  yKey="value"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma sala ocupada no momento
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista Resumida de Todas as Salas */}
          <Card>
            <CardHeader>
              <CardTitle>Ocupação por Sala</CardTitle>
              <CardDescription>
                Visão geral de todas as salas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {occupancy.map((occ) => {
                  const capacity = occ.capacity || 0;
                  const occupancyPercent = capacity > 0 
                    ? (occ.currentOccupancy / capacity) * 100 
                    : 0;
                  
                  return (
                    <div
                      key={occ.roomId}
                      className={`p-3 rounded-lg border ${
                        occ.currentOccupancy > 0 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{occ.roomNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {occ.currentOccupancy} {occ.currentOccupancy === 1 ? 'pessoa' : 'pessoas'}
                          </div>
                        </div>
                        {capacity > 0 && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Capacidade</div>
                            <div className="text-sm font-medium">
                              {occ.currentOccupancy}/{capacity}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {occupancyPercent.toFixed(0)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
