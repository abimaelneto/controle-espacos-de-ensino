import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, BarChart3, Activity } from 'lucide-react';
import { useStudentsStore } from '@/stores/students.store';
import { useRoomsStore } from '@/stores/rooms.store';

export default function Dashboard() {
  const { students, fetchStudents } = useStudentsStore();
  const { rooms, fetchRooms } = useRoomsStore();

  useEffect(() => {
    fetchStudents();
    fetchRooms();
  }, [fetchStudents, fetchRooms]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de controle de espaços
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#8a0538]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-[#8a0538]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8a0538]">{students.length}</div>
            <p className="text-xs text-[#505050]">
              Alunos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#9654ff]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Salas</CardTitle>
            <Building2 className="h-4 w-4 text-[#9654ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#9654ff]">{rooms.length}</div>
            <p className="text-xs text-[#505050]">
              Salas disponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#ff0040]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Hoje</CardTitle>
            <Activity className="h-4 w-4 text-[#ff0040]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#ff0040]">0</div>
            <p className="text-xs text-[#505050]">
              Check-ins hoje
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#8a0538]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <BarChart3 className="h-4 w-4 text-[#8a0538]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8a0538]">0%</div>
            <p className="text-xs text-[#505050]">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

