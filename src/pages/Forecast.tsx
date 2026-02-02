import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Trophy,
  Target
} from "lucide-react";
import { ForecastData, SpendingInsight } from "@/types/models";

// Mock forecast data with income vs expense
const mockForecastData: ForecastData[] = [
  { month: "Jan", predictedAmount: 1850, lowerBound: 1650, upperBound: 2050, confidence: 0.92 },
  { month: "Feb", predictedAmount: 1920, lowerBound: 1700, upperBound: 2140, confidence: 0.89 },
  { month: "Mar", predictedAmount: 2100, lowerBound: 1850, upperBound: 2350, confidence: 0.85 },
  { month: "Apr", predictedAmount: 1980, lowerBound: 1720, upperBound: 2240, confidence: 0.82 },
  { month: "May", predictedAmount: 2050, lowerBound: 1780, upperBound: 2320, confidence: 0.78 },
  { month: "Jun", predictedAmount: 2200, lowerBound: 1900, upperBound: 2500, confidence: 0.75 },
];

// Income vs Expense chart data
const chartData = [
  { month: "Jan", income: 45000, expense: 32000 },
  { month: "Feb", income: 48000, expense: 35000 },
  { month: "Mar", income: 52000, expense: 38000 },
  { month: "Apr", income: 47000, expense: 34000 },
  { month: "May", income: 55000, expense: 40000 },
  { month: "Jun", income: 58000, expense: 42000 },
];

const mockInsights: SpendingInsight[] = [
  {
    type: "warning",
    title: "Shopping spike expected",
    description: "Based on your patterns, expect higher shopping expenses in March due to seasonal sales.",
    category: "shopping",
  },
  {
    type: "tip",
    title: "Utility bills optimization",
    description: "Your electricity bills are 15% higher than average. Consider switching to energy-efficient appliances.",
    category: "bills",
  },
  {
    type: "achievement",
    title: "Great food budget control!",
    description: "You've stayed under your food budget for 3 consecutive months. Keep it up!",
    category: "food",
  },
];

const insightIcons = {
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  tip: <Lightbulb className="h-5 w-5 text-primary" />,
  achievement: <Trophy className="h-5 w-5 text-success" />,
};

const insightStyles = {
  warning: "border-warning/20 bg-warning/5",
  tip: "border-primary/20 bg-primary/5",
  achievement: "border-success/20 bg-success/5",
};

const ForecastPage = () => {
  const nextMonthForecast = mockForecastData[0];
  const avgMonthlySpending = mockForecastData.reduce((sum, f) => sum + f.predictedAmount, 0) / mockForecastData.length;
  const lastExpense = chartData[chartData.length - 2]?.expense || 40000;
  const trend = ((nextMonthForecast.predictedAmount - lastExpense) / lastExpense) * 100;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Month Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{nextMonthForecast.predictedAmount.toFixed(0)}</div>
            <div className="flex items-center gap-1 mt-1">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-success" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-destructive' : 'text-success'}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              6-Month Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgMonthlySpending.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Predicted monthly spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confidence Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(nextMonthForecast.confidence * 100)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Prediction accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹320</div>
            <p className="text-xs text-muted-foreground mt-1">If you follow AI tips</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Forecast Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Spending Forecast
            </CardTitle>
          <CardDescription>
            Monthly income vs expense comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="hsl(var(--success))"
                  name="Income"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  fill="hsl(var(--destructive))"
                  name="Expense"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive" />
              <span>Expense</span>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Personalized tips based on your spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockInsights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${insightStyles[insight.type]}`}
              >
                <div className="flex items-start gap-3">
                  {insightIcons[insight.type]}
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.category && (
                      <Badge variant="secondary" className="mt-2 capitalize">
                        {insight.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Forecast Breakdown</CardTitle>
          <CardDescription>Detailed predictions for the next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockForecastData.map((forecast, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{forecast.month} 2024</h4>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(forecast.confidence * 100)}% confident
                  </Badge>
                </div>
                <div className="text-2xl font-bold">₹{forecast.predictedAmount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Range: ₹{forecast.lowerBound} - ₹{forecast.upperBound}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastPage;
