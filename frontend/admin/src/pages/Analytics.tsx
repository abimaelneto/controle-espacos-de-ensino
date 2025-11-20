import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Relatórios e análises de uso dos espaços
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
          <CardDescription>
            Visualize métricas e estatísticas de uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gráficos e relatórios serão implementados aqui</p>
        </CardContent>
      </Card>
    </div>
  );
}

