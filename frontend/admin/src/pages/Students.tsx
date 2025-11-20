import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Students() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">
            Gerenciamento de alunos cadastrados
          </p>
        </div>
        <Button>Novo Aluno</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os alunos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Lista de alunos será implementada aqui</p>
        </CardContent>
      </Card>
    </div>
  );
}

