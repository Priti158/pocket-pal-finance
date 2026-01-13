import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Check,
  Plus,
  Edit,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  Heart,
  GraduationCap,
  MoreVertical
} from "lucide-react";
import { Budget as BudgetType, BudgetSuggestion, ExpenseCategory } from "@/types/models";

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  food: <Utensils className="h-5 w-5" />,
  transport: <Car className="h-5 w-5" />,
  shopping: <ShoppingBag className="h-5 w-5" />,
  entertainment: <Film className="h-5 w-5" />,
  bills: <FileText className="h-5 w-5" />,
  health: <Heart className="h-5 w-5" />,
  education: <GraduationCap className="h-5 w-5" />,
  other: <MoreVertical className="h-5 w-5" />,
};

const categoryColors: Record<ExpenseCategory, string> = {
  food: "text-category-food",
  transport: "text-category-transport",
  shopping: "text-category-shopping",
  entertainment: "text-category-entertainment",
  bills: "text-category-bills",
  health: "text-category-health",
  education: "text-category-education",
  other: "text-category-other",
};

// Mock data
const mockBudgets: BudgetType[] = [
  { id: "1", userId: "1", category: "food", amount: 500, month: "January", year: 2024, spent: 320, remaining: 180 },
  { id: "2", userId: "1", category: "transport", amount: 200, month: "January", year: 2024, spent: 185, remaining: 15 },
  { id: "3", userId: "1", category: "shopping", amount: 300, month: "January", year: 2024, spent: 420, remaining: -120 },
  { id: "4", userId: "1", category: "entertainment", amount: 150, month: "January", year: 2024, spent: 89, remaining: 61 },
  { id: "5", userId: "1", category: "bills", amount: 400, month: "January", year: 2024, spent: 385, remaining: 15 },
  { id: "6", userId: "1", category: "health", amount: 100, month: "January", year: 2024, spent: 45, remaining: 55 },
];

const mockSuggestions: BudgetSuggestion[] = [
  { category: "food", suggestedAmount: 450, currentSpending: 320, percentChange: -10, reason: "Your food spending has been consistent. Consider reducing by 10% to save more." },
  { category: "transport", suggestedAmount: 220, currentSpending: 185, percentChange: 10, reason: "You've been close to your limit. Slight increase recommended for flexibility." },
  { category: "shopping", suggestedAmount: 250, currentSpending: 420, percentChange: -17, reason: "You consistently overspend on shopping. Consider setting a stricter limit." },
];

const BudgetPage = () => {
  const [budgets, setBudgets] = useState<BudgetType[]>(mockBudgets);
  const [suggestions] = useState<BudgetSuggestion[]>(mockSuggestions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<ExpenseCategory | "">("");
  const [newAmount, setNewAmount] = useState("");

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-warning";
    return "bg-primary";
  };

  const getStatusBadge = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) {
      return <Badge variant="destructive">Over Budget</Badge>;
    }
    if (percentage >= 80) {
      return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
    }
    return <Badge variant="secondary">On Track</Badge>;
  };

  const handleAddBudget = () => {
    if (!newCategory || !newAmount) return;
    
    const newBudget: BudgetType = {
      id: Date.now().toString(),
      userId: "1",
      category: newCategory as ExpenseCategory,
      amount: parseFloat(newAmount),
      month: "January",
      year: 2024,
      spent: 0,
      remaining: parseFloat(newAmount),
    };
    
    setBudgets([...budgets, newBudget]);
    setNewCategory("");
    setNewAmount("");
    setIsAddDialogOpen(false);
  };

  const applySuggestion = (suggestion: BudgetSuggestion) => {
    setBudgets(budgets.map(b => 
      b.category === suggestion.category 
        ? { ...b, amount: suggestion.suggestedAmount, remaining: suggestion.suggestedAmount - b.spent }
        : b
    ));
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBudget - totalSpent < 0 ? 'text-destructive' : 'text-success'}`}>
              ${(totalBudget - totalSpent).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Left to spend</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Category Budgets</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Budget</DialogTitle>
                  <DialogDescription>
                    Set a budget for a spending category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newCategory} onValueChange={(val) => setNewCategory(val as ExpenseCategory)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food & Dining</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="bills">Bills</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Budget Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddBudget}>Add Budget</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {budgets.map((budget) => (
              <Card key={budget.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${categoryColors[budget.category]}`}>
                        {categoryIcons[budget.category]}
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">{budget.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(budget.spent, budget.amount)}
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min((budget.spent / budget.amount) * 100, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{((budget.spent / budget.amount) * 100).toFixed(0)}% used</span>
                    <span className={budget.remaining < 0 ? 'text-destructive' : ''}>
                      {budget.remaining < 0 ? '-' : ''}${Math.abs(budget.remaining).toFixed(2)} remaining
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Budget Suggestions
              </CardTitle>
              <CardDescription>
                Smart recommendations based on your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 rounded-lg border bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={categoryColors[suggestion.category]}>
                        {categoryIcons[suggestion.category]}
                      </span>
                      <span className="font-medium capitalize">{suggestion.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {suggestion.percentChange < 0 ? (
                        <TrendingDown className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-warning" />
                      )}
                      <span className={`text-sm font-medium ${suggestion.percentChange < 0 ? 'text-success' : 'text-warning'}`}>
                        {suggestion.percentChange > 0 ? '+' : ''}{suggestion.percentChange}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Suggested: <span className="font-medium text-foreground">${suggestion.suggestedAmount}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {suggestion.reason}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <Check className="mr-2 h-3 w-3" />
                    Apply Suggestion
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Warning Card */}
          {budgets.some(b => b.spent > b.amount) && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Budget Alert</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You've exceeded your budget in {budgets.filter(b => b.spent > b.amount).length} categories. 
                      Consider adjusting your spending or budgets.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
