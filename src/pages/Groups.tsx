import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  UserPlus,
  DollarSign,
  ArrowRightLeft,
  ChevronRight,
  Receipt
} from "lucide-react";
import { Group, GroupExpense, GroupMember } from "@/types/models";

// Mock data
const mockGroups: Group[] = [
  {
    id: "1",
    name: "Apartment Roommates",
    description: "Shared apartment expenses",
    createdBy: "1",
    members: [
      { userId: "1", name: "John Doe", email: "john@example.com", balance: 125.50 },
      { userId: "2", name: "Jane Smith", email: "jane@example.com", balance: -75.25 },
      { userId: "3", name: "Mike Johnson", email: "mike@example.com", balance: -50.25 },
    ],
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Weekend Trip",
    description: "Beach vacation expenses",
    createdBy: "1",
    members: [
      { userId: "1", name: "John Doe", email: "john@example.com", balance: -45.00 },
      { userId: "4", name: "Sarah Wilson", email: "sarah@example.com", balance: 120.00 },
      { userId: "5", name: "Tom Brown", email: "tom@example.com", balance: -75.00 },
    ],
    createdAt: "2024-01-10",
  },
];

const mockGroupExpenses: GroupExpense[] = [
  {
    id: "1",
    groupId: "1",
    paidBy: "1",
    amount: 150.00,
    description: "Electricity bill - January",
    date: "2024-01-15",
    splitType: "equal",
    splits: [
      { userId: "1", amount: 50, isPaid: true },
      { userId: "2", amount: 50, isPaid: false },
      { userId: "3", amount: 50, isPaid: false },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    groupId: "1",
    paidBy: "2",
    amount: 89.50,
    description: "Grocery shopping",
    date: "2024-01-14",
    splitType: "equal",
    splits: [
      { userId: "1", amount: 29.83, isPaid: false },
      { userId: "2", amount: 29.83, isPaid: true },
      { userId: "3", amount: 29.83, isPaid: false },
    ],
    createdAt: "2024-01-14",
  },
];

const Groups = () => {
  const [groups] = useState<Group[]>(mockGroups);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleCreateGroup = () => {
    console.log("Creating group:", { name: newGroupName, description: newGroupDescription });
    setIsCreateDialogOpen(false);
    setNewGroupName("");
    setNewGroupDescription("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Groups</h2>
          <p className="text-sm text-muted-foreground">Manage shared expenses with friends and family</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a group to track shared expenses with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  placeholder="e.g., Apartment Roommates"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  placeholder="What's this group for?"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!selectedGroup ? (
        // Groups List View
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const userBalance = group.members.find(m => m.userId === "1")?.balance || 0;
            return (
              <Card 
                key={group.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedGroup(group)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 4).map((member, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {group.members.length > 4 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Your balance</p>
                      <p className={`font-semibold ${userBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {userBalance >= 0 ? '+' : ''}{userBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Group Detail View
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedGroup(null)}>
            ← Back to Groups
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{selectedGroup.name}</CardTitle>
                    <CardDescription>{selectedGroup.description}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedGroup.members.length} members
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                  <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Receipt className="mr-2 h-4 w-4" />
                        Add Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Group Expense</DialogTitle>
                        <DialogDescription>
                          Add a shared expense to split with the group
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Input placeholder="What was this expense for?" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Amount</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                            <Input type="number" placeholder="0.00" className="pl-8" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Split Type</label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">Equal Split</Button>
                            <Button variant="ghost" size="sm" className="flex-1">Custom</Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsAddExpenseOpen(false)}>Add Expense</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="balances">
            <TabsList>
              <TabsTrigger value="balances">Balances</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="settlements">Settlements</TabsTrigger>
            </TabsList>

            <TabsContent value="balances" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Member Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedGroup.members.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${member.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {member.balance >= 0 ? 'gets back' : 'owes'}
                          </p>
                          <p className={`text-xl font-bold ${member.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                            ₹{Math.abs(member.balance).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Group Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Paid By</TableHead>
                        <TableHead>Split</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockGroupExpenses.map((expense) => {
                        const payer = selectedGroup.members.find(m => m.userId === expense.paidBy);
                        return (
                          <TableRow key={expense.id}>
                            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(payer?.name || '')}
                                  </AvatarFallback>
                                </Avatar>
                                {payer?.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {expense.splitType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₹{expense.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settlements" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Suggested Settlements</CardTitle>
                  <CardDescription>Simplest way to settle all debts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <Avatar>
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Jane pays John</p>
                        <p className="text-lg font-bold">₹75.25</p>
                      </div>
                      <Button size="sm">Settle Up</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>MJ</AvatarFallback>
                        </Avatar>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <Avatar>
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Mike pays John</p>
                        <p className="text-lg font-bold">₹50.25</p>
                      </div>
                      <Button size="sm">Settle Up</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Groups;
