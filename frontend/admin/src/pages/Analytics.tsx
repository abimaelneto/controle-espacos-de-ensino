import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analyticsService, DashboardStats, RoomUsageTimeline, StudentStats } from '@/services/analytics.service';
import { useRoomsStore } from '@/stores/rooms.store';
import { useStudentsStore } from '@/stores/students.store';
import { Activity, Users, Building2, CheckCircle2, Loader2, Calendar, TrendingUp, Clock } from 'lucide-react';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';

type ReportType = 'dashboard' | 'room' | 'student';

export default function Analytics() {
  const [reportType, setReportType] = useState<ReportType>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [roomStats, setRoomStats] = useState<RoomUsageTimeline | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { rooms, fetchRooms } = useRoomsStore();
  const { students, fetchStudents } = useStudentsStore();

  // Carregar dados iniciais
  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, [fetchRooms, fetchStudents]);

  // Carregar dashboard stats
  useEffect(() => {
    if (reportType === 'dashboard') {
      loadDashboardStats();
    }
  }, [reportType]);

  // Carregar room stats
  useEffect(() => {
    if (reportType === 'room' && selectedRoomId) {
      loadRoomStats();
    }
  }, [reportType, selectedRoomId, startDate, endDate]);

  // Carregar student stats
  useEffect(() => {
    if (reportType === 'student' && selectedStudentId) {
      loadStudentStats();
    }
  }, [reportType, selectedStudentId, startDate, endDate]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      const data = await analyticsService.getDashboardStats(start, end);
      setDashboardStats(data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const loadRoomStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      const data = await analyticsService.getRoomUsageTimeline(selectedRoomId, start, end);
      setRoomStats(data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas da sala:', err);
      setError('Erro ao carregar estatísticas da sala.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      const data = await analyticsService.getStudentStats(selectedStudentId, start, end);
      setStudentStats(data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas do estudante:', err);
      setError('Erro ao carregar estatísticas do estudante.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    if (reportType === 'dashboard') {
      loadDashboardStats();
    } else if (reportType === 'room' && selectedRoomId) {
      loadRoomStats();
    } else if (reportType === 'student' && selectedStudentId) {
      loadStudentStats();
    }
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Definir datas padrão (últimos 30 dias)
  useEffect(() => {
    if (!startDate && !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setEndDate(end.toISOString().split('T')[0]);
      setStartDate(start.toISOString().split('T')[0]);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics e Relatórios</h1>
        <p className="text-muted-foreground">
          Relatórios históricos e análises de uso dos espaços de ensino
        </p>
      </div>

      {/* Tabs de Tipo de Relatório */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={reportType === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setReportType('dashboard')}
            >
              Dashboard Geral
            </Button>
            <Button
              variant={reportType === 'room' ? 'default' : 'outline'}
              onClick={() => setReportType('room')}
            >
              Histórico de Sala
            </Button>
            <Button
              variant={reportType === 'student' ? 'default' : 'outline'}
              onClick={() => setReportType('student')}
            >
              Histórico de Estudante
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Selecione o período e os critérios para o relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reportType === 'room' && (
              <div className="space-y-2">
                <Label htmlFor="room">Sala</Label>
                <Select
                  id="room"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  <option value="">Selecione uma sala</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomNumber} ({room.type})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {reportType === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="student">Estudante</Label>
                <Select
                  id="student"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">Selecione um estudante</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.matricula})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleApplyFilters} className="w-full md:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Conteúdo do Relatório */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando relatório...</span>
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
          {/* Dashboard Geral */}
          {reportType === 'dashboard' && dashboardStats && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Check-ins</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalCheckins}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardStats.period.startDate && dashboardStats.period.endDate
                        ? `${new Date(dashboardStats.period.startDate).toLocaleDateString('pt-BR')} - ${new Date(dashboardStats.period.endDate).toLocaleDateString('pt-BR')}`
                        : 'Período selecionado'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Check-ins Ativos</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.activeCheckins}</div>
                    <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Salas Ocupadas</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.roomsOccupied}</div>
                    <p className="text-xs text-muted-foreground">Salas com atividade</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.studentsActive}</div>
                    <p className="text-xs text-muted-foreground">Alunos com check-ins</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Histórico de Sala */}
          {reportType === 'room' && roomStats && selectedRoom && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Sala: {selectedRoom.roomNumber}</CardTitle>
                  <CardDescription>
                    {selectedRoom.type} - Período: {roomStats.period.startDate && roomStats.period.endDate
                      ? `${new Date(roomStats.period.startDate).toLocaleDateString('pt-BR')} - ${new Date(roomStats.period.endDate).toLocaleDateString('pt-BR')}`
                      : 'Todo o período'}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Check-ins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{roomStats.totalCheckins}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{roomStats.totalHours.toFixed(1)}h</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Alunos Únicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{roomStats.uniqueStudents}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Média por Dia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{roomStats.averageCheckinsPerDay.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">check-ins/dia</p>
                  </CardContent>
                </Card>
              </div>

              {roomStats.dailyStats && roomStats.dailyStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline de Uso</CardTitle>
                    <CardDescription>
                      Distribuição de check-ins ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart data={roomStats.dailyStats} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Histórico de Estudante */}
          {reportType === 'student' && studentStats && selectedStudent && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Relatório de Estudante: {selectedStudent.firstName} {selectedStudent.lastName}
                  </CardTitle>
                  <CardDescription>
                    {selectedStudent.matricula} - Período: {studentStats.period.startDate && studentStats.period.endDate
                      ? `${new Date(studentStats.period.startDate).toLocaleDateString('pt-BR')} - ${new Date(studentStats.period.endDate).toLocaleDateString('pt-BR')}`
                      : 'Todo o período'}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Check-ins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentStats.totalCheckins}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentStats.totalHours.toFixed(1)}h</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Salas Visitadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentStats.roomsVisited}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Média por Dia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentStats.averageCheckinsPerDay.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">check-ins/dia</p>
                  </CardContent>
                </Card>
              </div>

              {studentStats.dailyStats && studentStats.dailyStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline de Check-ins</CardTitle>
                    <CardDescription>
                      Distribuição de check-ins ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart data={studentStats.dailyStats} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Mensagem quando não há seleção */}
          {reportType === 'room' && !selectedRoomId && (
            <Card>
              <CardContent className="py-12">
                <p className="text-muted-foreground text-center">
                  Selecione uma sala para ver o relatório histórico
                </p>
              </CardContent>
            </Card>
          )}

          {reportType === 'student' && !selectedStudentId && (
            <Card>
              <CardContent className="py-12">
                <p className="text-muted-foreground text-center">
                  Selecione um estudante para ver o relatório histórico
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
