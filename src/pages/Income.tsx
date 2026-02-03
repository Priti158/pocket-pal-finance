import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Wallet, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type IncomeSource = 'salary' | 'freelance' | 'investment' | 'business' | 'rental' | 'other';

interface IncomeEntry {
  id: string;
  amount: number;
  source: IncomeSource;
  description: string;
  date: string;
}

const sourceColors: Record<IncomeSource, string> = {
  salary: 'bg-primary',
  freelance: 'bg-accent',
  investment: 'bg-success',
  business: 'bg-warning',
  rental: 'bg-secondary',
  other: 'bg-muted',
};

const Income = () => {
  const { toast } = useToast();
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([
    { id: '1', amount: 50000, source: 'salary', description: 'Monthly Salary', date: '2026-02-01' },
    { id: '2', amount: 15000, source: 'freelance', description: 'Web Development Project', date: '2026-01-28' },
    { id: '3', amount: 5000, source: 'investment', description: 'Dividend Income', date: '2026-01-25' },
    { id: '4', amount: 8000, source: 'rental', description: 'Property Rent', date: '2026-01-20' },
  ]);

  const [formData, setFormData] = useState({
    amount: '',
    source: '' as IncomeSource | '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.source || !formData.description) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const newEntry: IncomeEntry = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      source: formData.source as IncomeSource,
      description: formData.description,
      date: formData.date,
    };

    setIncomeEntries([newEntry, ...incomeEntries]);
    setFormData({ amount: '', source: '', description: '', date: new Date().toISOString().split('T')[0] });
    
    toast({
      title: 'Income Added',
      description: `₹${parseFloat(formData.amount).toLocaleString('en-IN')} added successfully.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-3xl font-bold">₹{totalIncome.toLocaleString('en-IN')}</p>
                <p className="text-sm text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  This month
                </p>
              </div>
              <div className="p-4 rounded-xl bg-success">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Income Sources</p>
                <p className="text-3xl font-bold">{new Set(incomeEntries.map(e => e.source)).size}</p>
                <p className="text-sm text-muted-foreground mt-1">Active sources</p>
              </div>
              <div className="p-4 rounded-xl bg-primary">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Income Form */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value as IncomeSource })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <Button type="submit" className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Income List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Income History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <Badge className={`${sourceColors[entry.source]} text-white capitalize`}>
                      {entry.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    +₹{entry.amount.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;
