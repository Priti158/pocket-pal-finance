import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianRupee, Download, FileText, Loader2, TrendingUp, Receipt, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ReceiptRow {
  id: string;
  amount: number;
  category: string;
  status: "pending" | "claimed" | "rejected";
  date: string;
  description: string | null;
  is_reimbursable: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Claims = () => {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchClaims = async () => {
      setLoading(true);
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = month === 11
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 2).padStart(2, "0")}-01`;

      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_reimbursable", true)
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date", { ascending: false });

      if (!error && data) setReceipts(data as ReceiptRow[]);
      setLoading(false);
    };
    fetchClaims();
  }, [user, month, year]);

  const totalClaim = receipts.reduce((s, r) => s + Number(r.amount), 0);
  const pendingCount = receipts.filter((r) => r.status === "pending").length;
  const claimedCount = receipts.filter((r) => r.status === "claimed").length;

  const categoryTotals = receipts.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + Number(r.amount);
    return acc;
  }, {});

  const handleDownloadCSV = () => {
    if (receipts.length === 0) {
      toast({ title: "No data", description: "No receipts to export.", variant: "destructive" });
      return;
    }
    const headers = ["Date", "Description", "Category", "Amount", "Status"];
    const rows = receipts.map((r) => [
      r.date,
      `"${r.description || ""}"`,
      r.category,
      Number(r.amount).toFixed(2),
      r.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `claim_report_${MONTHS[month]}_${year}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast({ title: "Report downloaded", description: `${MONTHS[month]} ${year} claim report exported.` });
  };

  const handleMarkAllClaimed = async () => {
    const pendingIds = receipts.filter((r) => r.status === "pending").map((r) => r.id);
    if (pendingIds.length === 0) return;
    const { error } = await supabase.from("receipts").update({ status: "claimed" }).in("id", pendingIds);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setReceipts((prev) => prev.map((r) => pendingIds.includes(r.id) ? { ...r, status: "claimed" } : r));
      toast({ title: "All marked as claimed", description: `${pendingIds.length} receipts updated.` });
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monthly Claims</h1>
          <p className="text-muted-foreground text-sm">Track and generate your reimbursement claims</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Claim</p>
                <p className="text-2xl font-bold">₹{totalClaim.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <Receipt className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Claimed</p>
                <p className="text-2xl font-bold">{claimedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" /> Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
                <div key={cat} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <span className="text-sm font-medium capitalize">{cat}</span>
                  <Badge variant="secondary">₹{total.toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleDownloadCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Download CSV Report
        </Button>
        <Button onClick={handleMarkAllClaimed} disabled={pendingCount === 0}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Mark All as Claimed
        </Button>
      </div>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reimbursable Receipts — {MONTHS[month]} {year}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No reimbursable receipts for {MONTHS[month]} {year}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.description || "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{r.category}</Badge></TableCell>
                    <TableCell className="text-right font-medium">₹{Number(r.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={r.status === "claimed" ? "bg-success/10 text-success" : r.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Claims;
