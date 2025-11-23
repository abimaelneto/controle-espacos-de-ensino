import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface LineChartProps {
  data: Array<{ date: string; checkins: number }>;
  title?: string;
}

export function LineChart({ data, title }: LineChartProps) {
  // Formatar datas para exibição
  const formattedData = data.map((item) => ({
    ...item,
    dateFormatted: new Date(item.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  }));

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="dateFormatted"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => `Data: ${value}`}
            formatter={(value: number) => [`${value} check-ins`, 'Check-ins']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="checkins"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Check-ins"
            dot={{ r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

