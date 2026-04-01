import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { Investment } from '@/types/investment';
import { formatIndianNumber, calculateInvestment } from '@/lib/investmentCalculator';
import { INVESTMENT_TYPES } from '@/types/investment';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Props {
  investments: Investment[];
}

export const InvestmentHistory = ({ investments }: Props) => {
  if (investments.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Investment List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No investments yet</p>
            <p className="text-sm">Add your first investment to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Investment List ({investments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Invested</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">Profit/Loss</TableHead>
                <TableHead className="text-right">Return %</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => {
                const result = calculateInvestment(inv);
                const isProfit = result.profit >= 0;
                const typeLabel = INVESTMENT_TYPES.find(t => t.value === inv.investmentType)?.label || inv.investmentType;
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.stockName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{formatIndianNumber(result.totalInvestment)}</TableCell>
                    <TableCell className="text-right">₹{formatIndianNumber(result.currentValue)}</TableCell>
                    <TableCell className={cn('text-right font-medium', isProfit ? 'text-success' : 'text-destructive')}>
                      <span className="flex items-center justify-end gap-1">
                        {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isProfit ? '+' : ''}₹{formatIndianNumber(result.profit)}
                      </span>
                    </TableCell>
                    <TableCell className={cn('text-right', isProfit ? 'text-success' : 'text-destructive')}>
                      {isProfit ? '+' : ''}{result.returnPercentage.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(inv.buyDate), 'dd MMM yyyy')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
