import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles } from 'lucide-react';

interface Props {
  insights: string[];
}

export const PortfolioInsights = ({ insights }: Props) => {
  if (insights.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          AI Portfolio Insights
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Insights generated using AI-based analysis of your portfolio
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
