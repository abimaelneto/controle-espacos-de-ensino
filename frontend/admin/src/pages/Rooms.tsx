import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Rooms() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salas</h1>
          <p className="text-muted-foreground">
            Gerenciamento de salas de ensino
          </p>
        </div>
        <Button>Nova Sala</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Salas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as salas disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Lista de salas será implementada aqui</p>
        </CardContent>
      </Card>
    </div>
  );
}

