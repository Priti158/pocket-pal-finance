import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Investment } from '@/types/investment';
import { calculateInvestment, formatIndianNumber } from '@/lib/investmentCalculator';
import { INVESTMENT_TYPES, TYPE_COLORS, InvestmentType } from '@/types/investment';

interface Props {
  investments: Investment[];
}

export const InvestmentCharts = ({ investments }: Props) => {
  if (investments.length === 0) return null;

  // Pie chart data - distribution by type
  const typeMap: Record<string, { invested: number; current: number; color: string }> = {};
  investments.forEach(inv => {
    const result = calculateInvestment(inv);
    const label = INVESTMENT_TYPES.find(t => t.value === inv.investmentType)?.label || 'Other';
    if (!typeMap[label]) {
      typeMap[label] = { invested: 0, current: 0, color: TYPE_COLORS[inv.investmentType as InvestmentType] || TYPE_COLORS.other };
    }
    typeMap[label].invested += result.totalInvestment;
    typeMap[label].current += result.currentValue;
  });

  const pieData = Object.entries(typeMap).map(([name, d]) => ({
    name, value: d.current, color: d.color,
  }));

  // Bar chart data - invested vs current by type
  const barData = Object.entries(typeMap).map(([name, d]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    'Invested': d.invested,
    'Current': d.current,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Portfolio Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `₹${formatIndianNumber(value)}`}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Invested vs Current Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={(v) => `₹${formatIndianNumber(v)}`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(value: number) => `₹${formatIndianNumber(value)}`}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Bar dataKey="Invested" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Current" fill="hsl(150, 70%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
