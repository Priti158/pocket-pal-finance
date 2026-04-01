import { Investment, InvestmentResult, InvestmentType, PortfolioSummary, TYPE_COLORS, INVESTMENT_TYPES } from '@/types/investment';

export function calculateInvestment(investment: Investment): InvestmentResult {
  const totalInvestment = investment.buyPrice * investment.quantity;
  const currentValue = investment.sellPrice * investment.quantity;
  const profit = currentValue - totalInvestment;
  const returnPercentage = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

  const buyDate = new Date(investment.buyDate);
  const sellDate = investment.sellDate ? new Date(investment.sellDate) : new Date();
  const holdingDays = Math.floor((sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
  const holdingMonths = holdingDays / 30;
  const isLongTerm = holdingMonths >= 12;

  const taxType = isLongTerm ? 'Long-Term Capital Gain' : 'Short-Term Capital Gain';
  const taxAmount = profit > 0 ? (profit * investment.taxSlab) / 100 : 0;
  const netProfit = profit - taxAmount;

  const aiInsight = generateAIInsight({
    profit, returnPercentage, taxType, taxAmount, netProfit, holdingMonths,
    stockName: investment.stockName, investmentType: investment.investmentType,
  });

  return { totalInvestment, currentValue, profit, returnPercentage, taxType, taxAmount, netProfit, aiInsight };
}

export function calculatePortfolioSummary(investments: Investment[]): PortfolioSummary {
  const results = investments.map(inv => ({ inv, result: calculateInvestment(inv) }));
  const totalInvested = results.reduce((s, r) => s + r.result.totalInvestment, 0);
  const currentValue = results.reduce((s, r) => s + r.result.currentValue, 0);
  const totalProfit = currentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const typeMap: Record<string, number> = {};
  results.forEach(({ inv, result }) => {
    const label = INVESTMENT_TYPES.find(t => t.value === inv.investmentType)?.label || inv.investmentType;
    typeMap[label] = (typeMap[label] || 0) + result.currentValue;
  });

  const distributionByType = Object.entries(typeMap).map(([type, value]) => {
    const typeKey = INVESTMENT_TYPES.find(t => t.label === type)?.value || 'other';
    return { type, value, color: TYPE_COLORS[typeKey as InvestmentType] || TYPE_COLORS.other };
  });

  return { totalInvested, currentValue, totalProfit, returnPercentage, distributionByType };
}

export function generatePortfolioInsights(investments: Investment[]): string[] {
  if (investments.length === 0) return [];
  const results = investments.map(inv => ({ inv, result: calculateInvestment(inv) }));
  const summary = calculatePortfolioSummary(investments);
  const insights: string[] = [];

  // Overall performance
  if (summary.returnPercentage > 15) {
    insights.push(`🚀 Your portfolio is performing excellently with ${summary.returnPercentage.toFixed(1)}% returns!`);
  } else if (summary.returnPercentage > 0) {
    insights.push(`📈 Your portfolio shows positive returns of ${summary.returnPercentage.toFixed(1)}%.`);
  } else if (summary.returnPercentage < -10) {
    insights.push(`📉 Your portfolio is down ${Math.abs(summary.returnPercentage).toFixed(1)}%. Consider reviewing your strategy.`);
  }

  // Type distribution
  const typeCount: Record<string, number> = {};
  investments.forEach(inv => { typeCount[inv.investmentType] = (typeCount[inv.investmentType] || 0) + 1; });
  const types = Object.keys(typeCount);

  if (types.length === 1) {
    insights.push(`⚠️ All investments are in ${INVESTMENT_TYPES.find(t => t.value === types[0])?.label}. Consider diversifying.`);
  } else if (types.length >= 3) {
    insights.push(`✅ Good diversification across ${types.length} investment types.`);
  }

  // FD insight
  const fdInvestments = results.filter(r => r.inv.investmentType === 'fd');
  if (fdInvestments.length > 0) {
    const avgFdReturn = fdInvestments.reduce((s, r) => s + r.result.returnPercentage, 0) / fdInvestments.length;
    if (avgFdReturn < 7) {
      insights.push(`💡 Your FD returns (${avgFdReturn.toFixed(1)}%) are below average. Consider higher-return options.`);
    } else {
      insights.push(`🏦 Your FD returns are stable at ${avgFdReturn.toFixed(1)}%.`);
    }
  }

  // MF insight
  const mfInvestments = results.filter(r => r.inv.investmentType === 'mutual_funds');
  if (mfInvestments.length > 0) {
    const totalMfValue = mfInvestments.reduce((s, r) => s + r.result.currentValue, 0);
    const mfPercent = summary.currentValue > 0 ? (totalMfValue / summary.currentValue) * 100 : 0;
    if (mfPercent > 50) {
      insights.push(`📊 Mutual Funds make up ${mfPercent.toFixed(0)}% of your portfolio. Consider diversifying into other asset classes.`);
    }
  }

  // Best performer
  if (results.length > 1) {
    const best = results.reduce((a, b) => a.result.returnPercentage > b.result.returnPercentage ? a : b);
    insights.push(`🏆 Best performer: ${best.inv.stockName} with ${best.result.returnPercentage.toFixed(1)}% returns.`);
  }

  return insights.length > 0 ? insights : ['📊 Add more investments to get personalized AI insights.'];
}

interface InsightParams {
  profit: number;
  returnPercentage: number;
  taxType: string;
  taxAmount: number;
  netProfit: number;
  holdingMonths: number;
  stockName: string;
  investmentType: InvestmentType;
}

function generateAIInsight(params: InsightParams): string {
  const { profit, returnPercentage, taxType, taxAmount, netProfit, holdingMonths, stockName, investmentType } = params;
  const insights: string[] = [];

  if (returnPercentage > 20) {
    insights.push(`🚀 Excellent! Your ${stockName} investment generated ${returnPercentage.toFixed(1)}% returns!`);
  } else if (returnPercentage > 10) {
    insights.push(`📈 Good returns! ${stockName} grew by ${returnPercentage.toFixed(1)}%.`);
  } else if (returnPercentage > 0) {
    insights.push(`💰 ${stockName} generated ${returnPercentage.toFixed(1)}% returns - modest but positive.`);
  } else if (returnPercentage < 0) {
    insights.push(`📉 ${stockName} shows ${Math.abs(returnPercentage).toFixed(1)}% loss. Review your strategy.`);
  }

  if (profit > 0 && taxType === 'Short-Term Capital Gain') {
    insights.push(`🧾 STCG tax of ₹${formatIndianNumber(taxAmount)} applies. Hold 12+ months for lower tax.`);
  } else if (profit > 0) {
    insights.push(`🧾 LTCG benefit applies - you saved on taxes by holding long-term.`);
  }

  if (holdingMonths < 12 && profit > 0) {
    insights.push(`⏳ Hold ${Math.ceil(12 - holdingMonths)} more month(s) for long-term tax benefits.`);
  }

  return insights.join(' ');
}

export function formatIndianNumber(num: number): string {
  const absNum = Math.abs(num);
  if (absNum >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
  if (absNum >= 100000) return (num / 100000).toFixed(2) + ' L';
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
