import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Calculator, Brain, BarChart3, PieChart, Sparkles } from 'lucide-react';
import { Investment, InvestmentFormData, INVESTMENT_TYPES, TYPE_COLORS, InvestmentType } from '@/types/investment';
import { calculateInvestment, calculatePortfolioSummary, formatIndianNumber } from '@/lib/investmentCalculator';
import { InvestmentForm } from '@/components/investment/InvestmentForm';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const InvestmentAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  const handleSubmit = (formData: InvestmentFormData) => {
    const investment: Investment = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString(),
    };
    setInvestments((prev) => [investment, ...prev]);
    toast({ title: 'Investment Added', description: `${formData.stockName} added for analysis.` });
  };

  const summary = investments.length > 0 ? calculatePortfolioSummary(investments) : null;

  const investmentResults = investments.map((inv) => ({
    investment: inv,
    result: calculateInvestment(inv),
  }));

  const taxBreakdown = investmentResults.reduce(
    (acc, { result }) => {
      if (result.taxType === 'Short-Term Capital Gain') {
        acc.stcg += result.taxAmount;
        acc.stcgCount++;
      } else {
        acc.ltcg += result.taxAmount;
        acc.ltcgCount++;
      }
      acc.totalTax += result.taxAmount;
      return acc;
    },
    { stcg: 0, ltcg: 0, totalTax: 0, stcgCount: 0, ltcgCount: 0 }
  );

  const profitLossData = investmentResults.map(({ investment, result }) => ({
    name: investment.stockName.length > 12 ? investment.stockName.slice(0, 12) + '…' : investment.stockName,
    invested: result.totalInvestment,
    current: result.currentValue,
    profit: result.profit,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/investments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-2 rounded-xl bg-primary/10">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Investment Analysis</h1>
            <p className="text-muted-foreground text-sm">Detailed profit, tax & AI-powered breakdown</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="tax">Tax Breakdown</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* ── ANALYSIS TAB ── */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <InvestmentForm onSubmit={handleSubmit} isLoading={false} />
            </div>

            <div className="lg:col-span-2 space-y-4">
              {investmentResults.length === 0 ? (
                <Card className="flex items-center justify-center h-64 border-dashed">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Add investments to see analysis</p>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Profit/Loss per investment chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" /> Invested vs Current Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={profitLossData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                          <Tooltip
                            formatter={(value: number) => `₹${formatIndianNumber(value)}`}
                            contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Bar dataKey="invested" name="Invested" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="current" name="Current" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Individual cards */}
                  <div className="space-y-3">
                    {investmentResults.map(({ investment, result }) => {
                      const isProfit = result.profit >= 0;
                      const isSelected = selectedInvestment?.id === investment.id;
                      return (
                        <Card
                          key={investment.id}
                          className={cn(
                            'cursor-pointer transition-all hover:shadow-md',
                            isSelected && 'ring-2 ring-primary'
                          )}
                          onClick={() => setSelectedInvestment(isSelected ? null : investment)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn('p-2 rounded-lg', isProfit ? 'bg-success/10' : 'bg-destructive/10')}>
                                  {isProfit ? (
                                    <TrendingUp className="h-4 w-4 text-success" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-destructive" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">{investment.stockName}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {INVESTMENT_TYPES.find((t) => t.value === investment.investmentType)?.label}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {result.taxType === 'Short-Term Capital Gain' ? 'STCG' : 'LTCG'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={cn('font-bold', isProfit ? 'text-success' : 'text-destructive')}>
                                  {isProfit ? '+' : ''}₹{formatIndianNumber(result.profit)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {isProfit ? '+' : ''}{result.returnPercentage.toFixed(2)}%
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Invested</p>
                                    <p className="font-semibold text-sm">₹{formatIndianNumber(result.totalInvestment)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Current Value</p>
                                    <p className="font-semibold text-sm">₹{formatIndianNumber(result.currentValue)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Tax ({investment.taxSlab}%)</p>
                                    <p className="font-semibold text-sm text-destructive">₹{formatIndianNumber(result.taxAmount)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Net Profit</p>
                                    <p className={cn('font-semibold text-sm', result.netProfit >= 0 ? 'text-success' : 'text-destructive')}>
                                      ₹{formatIndianNumber(result.netProfit)}
                                    </p>
                                  </div>
                                </div>
                                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                    <Brain className="h-3 w-3" /> AI Insight
                                  </p>
                                  <p className="text-sm">{result.aiInsight}</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── TAX TAB ── */}
        <TabsContent value="tax" className="space-y-6">
          {investments.length === 0 ? (
            <Card className="flex items-center justify-center h-64 border-dashed">
              <div className="text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Add investments to see tax breakdown</p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Total Tax Liability</p>
                    <p className="text-2xl font-bold text-destructive">₹{formatIndianNumber(taxBreakdown.totalTax)}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">STCG Tax ({taxBreakdown.stcgCount} items)</p>
                    <p className="text-2xl font-bold text-orange-500">₹{formatIndianNumber(taxBreakdown.stcg)}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">LTCG Tax ({taxBreakdown.ltcgCount} items)</p>
                    <p className="text-2xl font-bold text-primary">₹{formatIndianNumber(taxBreakdown.ltcg)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tax breakdown per investment */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tax Breakdown by Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Type</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Profit</th>
                          <th className="text-center py-2 px-3 text-muted-foreground font-medium">Tax Type</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Tax Slab</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Tax Amount</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investmentResults.map(({ investment, result }) => (
                          <tr key={investment.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-2 px-3 font-medium">{investment.stockName}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="text-xs">
                                {INVESTMENT_TYPES.find((t) => t.value === investment.investmentType)?.label}
                              </Badge>
                            </td>
                            <td className={cn('py-2 px-3 text-right font-medium', result.profit >= 0 ? 'text-success' : 'text-destructive')}>
                              ₹{formatIndianNumber(result.profit)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Badge variant={result.taxType === 'Short-Term Capital Gain' ? 'destructive' : 'default'} className="text-xs">
                                {result.taxType === 'Short-Term Capital Gain' ? 'STCG' : 'LTCG'}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-right">{investment.taxSlab}%</td>
                            <td className="py-2 px-3 text-right text-destructive font-medium">₹{formatIndianNumber(result.taxAmount)}</td>
                            <td className={cn('py-2 px-3 text-right font-medium', result.netProfit >= 0 ? 'text-success' : 'text-destructive')}>
                              ₹{formatIndianNumber(result.netProfit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Tax-saving tips */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> Tax-Saving Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {taxBreakdown.stcgCount > 0 && (
                    <p className="text-sm p-3 rounded-lg bg-background/50 border border-border/50">
                      ⏳ You have {taxBreakdown.stcgCount} short-term investment(s). Holding for 12+ months can reduce your tax rate significantly under LTCG.
                    </p>
                  )}
                  {taxBreakdown.totalTax > 0 && (
                    <p className="text-sm p-3 rounded-lg bg-background/50 border border-border/50">
                      💡 Consider tax-loss harvesting — sell underperforming assets to offset gains and reduce overall tax liability.
                    </p>
                  )}
                  <p className="text-sm p-3 rounded-lg bg-background/50 border border-border/50">
                    🏦 ELSS mutual funds offer tax deductions under Section 80C (up to ₹1.5L per year).
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── AI INSIGHTS TAB ── */}
        <TabsContent value="insights" className="space-y-6">
          {investments.length === 0 ? (
            <Card className="flex items-center justify-center h-64 border-dashed">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Add investments to get AI insights</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Per-investment insights */}
              <div className="space-y-3">
                {investmentResults.map(({ investment, result }) => (
                  <Card key={investment.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{investment.stockName}</p>
                            <Badge variant="outline" className="text-xs">
                              {INVESTMENT_TYPES.find((t) => t.value === investment.investmentType)?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">{result.aiInsight}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn('font-bold text-sm', result.profit >= 0 ? 'text-success' : 'text-destructive')}>
                            {result.profit >= 0 ? '+' : ''}₹{formatIndianNumber(result.profit)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Portfolio-level AI summary */}
              {summary && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Portfolio AI Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm p-3 rounded-lg bg-background/50 border border-border/50">
                      📊 Total Portfolio: ₹{formatIndianNumber(summary.totalInvested)} invested → ₹{formatIndianNumber(summary.currentValue)} current value
                    </p>
                    <p className="text-sm p-3 rounded-lg bg-background/50 border border-border/50">
                      {summary.returnPercentage >= 0 ? '📈' : '📉'} Overall Return: {summary.returnPercentage >= 0 ? '+' : ''}{summary.returnPercentage.toFixed(2)}%
                    </p>
                    <p className="text-sm p-3 rounded-lg bg-background/50 border border-border/50">
                      🧾 Total Tax Liability: ₹{formatIndianNumber(taxBreakdown.totalTax)} (STCG: ₹{formatIndianNumber(taxBreakdown.stcg)} | LTCG: ₹{formatIndianNumber(taxBreakdown.ltcg)})
                    </p>
                    {summary.distributionByType.length > 0 && (
                      <p className="text-sm p-3 rounded-lg bg-background/50 border border-border/50">
                        🎯 Diversification: {summary.distributionByType.map((d) => `${d.type} (${((d.value / summary.currentValue) * 100).toFixed(0)}%)`).join(', ')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentAnalysis;
