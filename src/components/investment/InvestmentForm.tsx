import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Calendar, IndianRupee, Hash, Building2, Percent } from 'lucide-react';
import { InvestmentFormData, TAX_SLABS, INVESTMENT_TYPES, InvestmentType } from '@/types/investment';

interface InvestmentFormProps {
  onSubmit: (data: InvestmentFormData) => void;
  isLoading?: boolean;
}

export const InvestmentForm = ({ onSubmit, isLoading }: InvestmentFormProps) => {
  const [formData, setFormData] = useState<InvestmentFormData>({
    stockName: '',
    investmentType: 'stocks',
    buyPrice: 0,
    quantity: 1,
    sellPrice: 0,
    buyDate: new Date().toISOString().split('T')[0],
    sellDate: new Date().toISOString().split('T')[0],
    taxSlab: 15,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof InvestmentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showInterestRate = formData.investmentType === 'fd';

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Add Investment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Investment Type */}
          <div className="space-y-2">
            <Label>Investment Type</Label>
            <Select
              value={formData.investmentType}
              onValueChange={(v) => handleInputChange('investmentType', v as InvestmentType)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INVESTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="stockName" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Investment Name
            </Label>
            <Input
              id="stockName"
              placeholder="e.g., SBI Mutual Fund, Reliance"
              value={formData.stockName}
              onChange={(e) => handleInputChange('stockName', e.target.value)}
              required
            />
          </div>

          {/* Amount & Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyPrice" className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                Amount Invested (₹)
              </Label>
              <Input
                id="buyPrice" type="number" min="0" step="0.01" placeholder="0.00"
                value={formData.buyPrice || ''}
                onChange={(e) => handleInputChange('buyPrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Quantity / Units
              </Label>
              <Input
                id="quantity" type="number" min="1" placeholder="1"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* Current Value */}
          <div className="space-y-2">
            <Label htmlFor="sellPrice" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              Current Value (₹)
            </Label>
            <Input
              id="sellPrice" type="number" min="0" step="0.01" placeholder="0.00"
              value={formData.sellPrice || ''}
              onChange={(e) => handleInputChange('sellPrice', parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {/* Interest Rate for FD */}
          {showInterestRate && (
            <div className="space-y-2">
              <Label htmlFor="interestRate" className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                Interest Rate (%)
              </Label>
              <Input
                id="interestRate" type="number" min="0" step="0.1" placeholder="7.0"
                value={formData.interestRate || ''}
                onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Start Date
              </Label>
              <Input id="buyDate" type="date" value={formData.buyDate}
                onChange={(e) => handleInputChange('buyDate', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                End Date (Optional)
              </Label>
              <Input id="sellDate" type="date" value={formData.sellDate}
                onChange={(e) => handleInputChange('sellDate', e.target.value)} />
            </div>
          </div>

          {/* Tax Slab */}
          <div className="space-y-2">
            <Label>Tax Slab (%)</Label>
            <Select
              value={formData.taxSlab.toString()}
              onValueChange={(v) => handleInputChange('taxSlab', parseFloat(v))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TAX_SLABS.map((s) => (
                  <SelectItem key={s.value} value={s.value.toString()}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Add & Analyze'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
