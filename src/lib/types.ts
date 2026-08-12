export interface ScopeItem {
  id: string;
  text: string;
  category: 'in-scope' | 'out-of-scope' | 'assumption';
  freelancerApproved: boolean | null;
  clientApproved: boolean | null;
  estimatedPrice?: number;
}

export interface ChangeOrder {
  id: string;
  requestText: string;
  description: string;
  approvedPrice: number;
  approvedAt: string;
  originalRequestId: string;
}

export interface ScopePage {
  id: string;
  title: string;
  items: ScopeItem[];
  timeline?: string | null;
  revisionPolicy?: string | null;
  createdAt: string;
  status: 'draft' | 'freelancer_review' | 'client_review' | 'client_signed' | 'locked' | 'archived';
  lockedAt: string | null;
  freelancerName: string;
  freelancerEmail?: string;
  clientName: string;
  clientEmail: string;
  shareToken: string;
  viewCount: number;
  lastViewedAt?: string;
  budgetType: 'hourly' | 'fixed_total';
  totalBudget?: number;
  hourlyRate?: number;
  currency: string;
  signature?: {
    signerName: string;
    signedAt: string;
    type: 'freelancer' | 'agency';
    stampDataUrl?: string;
  };
  clientSignature?: {
    signerName: string;
    signedAt: string;
  };
  changeOrders?: ChangeOrder[];
}

export interface ChangeRequest {
  id: string;
  scopeId: string;
  requestText: string;
  clientName: string;
  clientEmail: string;
  aiAnalysis: {
    verdict: 'in-scope' | 'out-of-scope';
    reasoning: string;
    estimatedCostLow: number;
    estimatedCostMedian: number;
    estimatedCostHigh: number;
    estimatedHours: { low: number; median: number; high: number };
    timelineImpact: string;
    suggestedReply: string;
    lockedItemReference?: string | null;
    marketBenchmark?: { low: number; median: number; high: number };
    budgetImpact?: string;
  };
  status: 'pending' | 'countered' | 'approved' | 'declined';
  freelancerCounterOffer?: number;
  freelancerResponse?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ScopeDebt {
  totalBillable: number;
  totalPending: number;
  totalRequests: number;
  thisMonth: number;
  allTime: number;
}

export interface CustomRate {
  id: string;
  taskType: string;
  rateType: 'fixed' | 'hourly';
  rateValue: number;
  estimatedHours?: number;
  description: string;
}

export interface AppSettings {
  geminiApiKey?: string;
  businessType: 'freelancer' | 'agency';
  companyName?: string;
  companyStampDataUrl?: string;
  freelancerName: string;
  freelancerEmail?: string;
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'PKR' | 'AUD' | 'CAD' | 'INR';
  rateMode: 'hourly' | 'project' | 'hybrid';
  hourlyRate: number;
  currency: string;
  skillCategory: string;
  experienceLevel: string;
  region: string;
  customRates: CustomRate[];
}

export interface RateBenchmark {
  taskType: string;
  marketLow: number;
  marketMedian: number;
  marketHigh: number;
  region: string;
  experienceLevel: string;
  currency: string;
  source: 'ai-knowledge' | 'user-override' | 'upwork-estimate';
  lastUpdated: string;
}
