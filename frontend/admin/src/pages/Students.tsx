import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudentsStore } from '@/stores/students.store';
import { StudentForm } from '@/components/forms/StudentForm';
import { Loader2, Trash2 } from 'lucide-react';
import type { Student, CreateStudentDto, UpdateStudentDto } from '@/services/students.service';
import { analyticsService, StudentStats } from '@/services/analytics.service';
import { LineChart } from '@/components/charts/LineChart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Students() {
  const { students, loading, error, fetchStudents, createStudent, updateStudent, deleteStudent } = useStudentsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreate = () => {
    setSelectedStudent(null);
    setFormOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleViewStats = async (student: Student) => {
    setSelectedStudent(student);
    setStatsDialogOpen(true);
    setLoadingStats(true);
    try {
      const stats = await analyticsService.getStudentStats(student.id);
      setStudentStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const confirmDelete = async () => {
    if (selectedStudent) {
      await deleteStudent(selectedStudent.id);
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
    }
  };

  const handleSubmit = async (data: CreateStudentDto | UpdateStudentDto) => {
    if (selectedStudent) {
      await updateStudent(selectedStudent.id, data as UpdateStudentDto);
    } else {
      await createStudent(data as CreateStudentDto);
    }
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">
            Gerenciamento de alunos cadastrados
          </p>
        </div>
        <Button onClick={handleCreate}>Novo Aluno</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os alunos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : students.length === 0 ? (
            <p className="text-muted-foreground">Nenhum aluno cadastrado</p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  data-testid="student-card"
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {student.email} • {student.matricula}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewStats(student)}>
                      Analytics
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(student)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <StudentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        student={selectedStudent}
        onSubmit={handleSubmit}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o aluno {selectedStudent?.firstName} {selectedStudent?.lastName}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Analytics - {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogTitle>
            <DialogDescription>
              Estatísticas de uso e check-ins do aluno
            </DialogDescription>
          </DialogHeader>
          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : studentStats ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentStats.totalCheckins}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Horas</CardTitle>
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
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Check-ins por Dia</CardTitle>
                  <CardDescription>
                    Período: {new Date(studentStats.period.startDate).toLocaleDateString('pt-BR')} - {new Date(studentStats.period.endDate).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart data={studentStats.dailyStats} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

