export interface ScopeItem {
  id: string;
  text: string;
  category: 'in-scope' | 'out-of-scope' | 'assumption';
  freelancerApproved: boolean | null;
  clientApproved: boolean | null;
}

export interface ScopePage {
  id: string;
  title: string;
  items: ScopeItem[];
  timeline?: string;
  revisionPolicy?: string;
  createdAt: string;
  status: 'draft' | 'freelancer_review' | 'client_review' | 'locked' | 'archived';
  lockedAt: string | null;
  freelancerName: string;
  freelancerEmail?: string;
  clientName: string;
  clientEmail: string;
  shareToken: string;
  viewCount: number;
  lastViewedAt?: string;
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
  };
  status: 'pending' | 'approved' | 'declined' | 'countered';
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
  freelancerName: string;
  freelancerEmail?: string;
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD';
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
