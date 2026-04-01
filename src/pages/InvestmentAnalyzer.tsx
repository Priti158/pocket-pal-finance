import { useState } from 'react';
import { InvestmentForm } from '@/components/investment/InvestmentForm';
import { PortfolioSummaryCards } from '@/components/investment/PortfolioSummaryCards';
import { InvestmentCharts } from '@/components/investment/InvestmentCharts';
import { PortfolioInsights } from '@/components/investment/PortfolioInsights';
import { InvestmentHistory } from '@/components/investment/InvestmentHistory';
import { Investment, InvestmentFormData } from '@/types/investment';
import { calculatePortfolioSummary, generatePortfolioInsights } from '@/lib/investmentCalculator';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, BarChart3 } from 'lucide-react';

const InvestmentAnalyzer = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (formData: InvestmentFormData) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const investment: Investment = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setInvestments((prev) => [investment, ...prev]);
      setIsAnalyzing(false);
      toast({
        title: 'Investment Added',
        description: `${formData.stockName} has been added to your portfolio.`,
      });
    }, 500);
  };

  const summary = investments.length > 0 ? calculatePortfolioSummary(investments) : null;
  const insights = generatePortfolioInsights(investments);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Investment Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Track all investments, view portfolio performance & get AI insights
          </p>
        </div>
      </div>

      {/* Portfolio Summary */}
      {summary && <PortfolioSummaryCards summary={summary} investmentCount={investments.length} />}

      {/* Charts */}
      <InvestmentCharts investments={investments} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <InvestmentForm onSubmit={handleSubmit} isLoading={isAnalyzing} />
        </div>

        {/* Insights */}
        <div className="lg:col-span-2">
          {insights.length > 0 ? (
            <PortfolioInsights insights={insights} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed border-border/50 bg-muted/20">
              <BarChart3 className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No Analysis Yet</p>
              <p className="text-sm text-muted-foreground/70">Add investments to see portfolio insights</p>
            </div>
          )}
        </div>
      </div>

      {/* Investment List */}
      <InvestmentHistory investments={investments} />
    </div>
  );
};

export default InvestmentAnalyzer;
