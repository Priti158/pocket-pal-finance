// Investment types
export type InvestmentType = 'stocks' | 'mutual_funds' | 'fd' | 'sip' | 'gold' | 'crypto' | 'other';

export const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'fd', label: 'Fixed Deposit (FD)' },
  { value: 'sip', label: 'SIP' },
  { value: 'gold', label: 'Gold' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Other' },
];

export interface Investment {
  id: string;
  stockName: string;
  investmentType: InvestmentType;
  buyPrice: number;
  quantity: number;
  sellPrice: number;
  interestRate?: number;
  buyDate: string;
  sellDate?: string;
  taxSlab: number;
  createdAt: string;
}

export interface InvestmentResult {
  totalInvestment: number;
  currentValue: number;
  profit: number;
  returnPercentage: number;
  taxType: 'Short-Term Capital Gain' | 'Long-Term Capital Gain';
  taxAmount: number;
  netProfit: number;
  aiInsight: string;
}

export interface InvestmentFormData {
  stockName: string;
  investmentType: InvestmentType;
  buyPrice: number;
  quantity: number;
  sellPrice: number;
  interestRate?: number;
  buyDate: string;
  sellDate?: string;
  taxSlab: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  returnPercentage: number;
  distributionByType: { type: string; value: number; color: string }[];
}

export const TAX_SLABS = [
  { value: 10, label: '10% - Standard STCG' },
  { value: 15, label: '15% - STCG (Equity)' },
  { value: 20, label: '20% - LTCG with Indexation' },
  { value: 12.5, label: '12.5% - LTCG (Equity above ₹1L)' },
  { value: 30, label: '30% - Higher Tax Bracket' },
];

export const TYPE_COLORS: Record<InvestmentType, string> = {
  stocks: 'hsl(210, 80%, 55%)',
  mutual_funds: 'hsl(150, 70%, 45%)',
  fd: 'hsl(45, 90%, 50%)',
  sip: 'hsl(280, 70%, 55%)',
  gold: 'hsl(35, 85%, 55%)',
  crypto: 'hsl(0, 75%, 55%)',
  other: 'hsl(200, 20%, 55%)',
};
