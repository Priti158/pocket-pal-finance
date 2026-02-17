import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  FileImage,
  Sparkles,
  Check,
  Edit,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ReceiptData, ExpenseCategory } from "@/types/models";

const ScanReceipt = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveForClaim, setSaveForClaim] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [date, setDate] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setExtractedData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setExtractedData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processReceipt = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setProgress(0);

    // Simulate OCR processing with progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    clearInterval(progressInterval);
    setProgress(100);

    // Mock extracted data (would come from Django OCR endpoint)
    const mockData: ReceiptData = {
      extractedText: "WALMART SUPERCENTER\n123 Main Street\nCity, State 12345\n\nGroceries $45.99\nTax $3.82\n\nTOTAL $49.81\n\nDate: 01/15/2024\nThank you for shopping!",
      suggestedAmount: 49.81,
      suggestedCategory: "food",
      suggestedDescription: "Groceries at Walmart Supercenter",
      suggestedDate: "2024-01-15",
      confidence: 0.92,
    };

    setExtractedData(mockData);
    setAmount(mockData.suggestedAmount?.toString() || "");
    setDescription(mockData.suggestedDescription || "");
    setCategory(mockData.suggestedCategory || "other");
    setDate(mockData.suggestedDate || "");
    setIsProcessing(false);
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Not logged in", variant: "destructive" });
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    // Save to receipts table for history & claims
    if (saveForClaim) {
      const { error } = await supabase.from("receipts").insert({
        user_id: user.id,
        amount: parsedAmount,
        category,
        description,
        date: date || new Date().toISOString().split("T")[0],
        is_reimbursable: true,
        status: "pending",
        extracted_text: extractedData?.extractedText || null,
        ai_confidence: extractedData?.confidence || null,
        ai_detected_category: extractedData?.suggestedCategory || null,
      });
      if (error) {
        toast({ title: "Error saving receipt", description: error.message, variant: "destructive" });
        return;
      }
      toast({
        title: "Receipt saved for claim",
        description: `₹${parsedAmount.toFixed(2)} added to receipt history & monthly claims.`,
      });
      navigate("/receipts");
    } else {
      toast({
        title: "Expense saved",
        description: `₹${parsedAmount.toFixed(2)} expense recorded.`,
      });
      navigate("/expenses");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan Receipt
            </CardTitle>
            <CardDescription>
              Upload or take a photo of your receipt for automatic extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedImage ? (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your receipt image here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <Button variant="outline" type="button">
                  <FileImage className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={selectedImage}
                    alt="Receipt"
                    className="w-full h-auto max-h-[400px] object-contain bg-muted"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-sm font-medium mb-2">Processing receipt...</p>
                      <Progress value={progress} className="w-48" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null);
                      setExtractedData(null);
                    }}
                    className="flex-1"
                  >
                    Change Image
                  </Button>
                  <Button
                    onClick={processReceipt}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Extract Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted Data Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Extracted Information
            </CardTitle>
            <CardDescription>
              Review and edit the AI-extracted expense details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!extractedData ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload and process a receipt to see extracted data</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(extractedData.confidence * 100)}% confidence
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={!isEditing}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={category}
                      onValueChange={(val) => setCategory(val as ExpenseCategory)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-3">Extracted Text:</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                    {extractedData.extractedText}
                  </pre>
                </div>
                <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="save-claim" className="text-sm font-medium cursor-pointer">
                      Save for Business Allowance
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Add to receipt history & monthly claims
                    </p>
                  </div>
                  <Switch
                    id="save-claim"
                    checked={saveForClaim}
                    onCheckedChange={setSaveForClaim}
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  <Check className="mr-2 h-4 w-4" />
                  {saveForClaim ? "Save & Add to Claims" : "Save Expense"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanReceipt;
