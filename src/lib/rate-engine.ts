import { AppSettings, RateBenchmark } from './types';

const MARKET_RATES: Record<string, Record<string, Record<string, { low: number; median: number; high: number }>>> = {
  'web-dev': {
    'junior': { 'us': { low: 25, median: 40, high: 60 }, 'uk': { low: 20, median: 35, high: 50 }, 'eu': { low: 20, median: 35, high: 50 }, 'asia': { low: 10, median: 20, high: 35 }, 'latam': { low: 15, median: 25, high: 40 }, 'africa': { low: 10, median: 20, high: 30 }, 'remote-global': { low: 15, median: 30, high: 50 } },
    'mid': { 'us': { low: 50, median: 75, high: 100 }, 'uk': { low: 40, median: 60, high: 85 }, 'eu': { low: 40, median: 60, high: 85 }, 'asia': { low: 20, median: 35, high: 55 }, 'latam': { low: 25, median: 45, high: 65 }, 'africa': { low: 20, median: 35, high: 50 }, 'remote-global': { low: 30, median: 55, high: 80 } },
    'senior': { 'us': { low: 80, median: 120, high: 175 }, 'uk': { low: 65, median: 95, high: 140 }, 'eu': { low: 65, median: 95, high: 140 }, 'asia': { low: 35, median: 60, high: 90 }, 'latam': { low: 45, median: 75, high: 110 }, 'africa': { low: 35, median: 60, high: 85 }, 'remote-global': { low: 50, median: 90, high: 130 } },
    'expert': { 'us': { low: 120, median: 175, high: 250 }, 'uk': { low: 100, median: 150, high: 200 }, 'eu': { low: 100, median: 150, high: 200 }, 'asia': { low: 50, median: 90, high: 140 }, 'latam': { low: 70, median: 110, high: 160 }, 'africa': { low: 50, median: 90, high: 130 }, 'remote-global': { low: 80, median: 130, high: 190 } }
  },
  'ui-ux-design': {
    'junior': { 'us': { low: 20, median: 35, high: 50 }, 'uk': { low: 18, median: 30, high: 45 }, 'eu': { low: 18, median: 30, high: 45 }, 'asia': { low: 8, median: 18, high: 30 }, 'latam': { low: 12, median: 22, high: 35 }, 'africa': { low: 8, median: 18, high: 28 }, 'remote-global': { low: 12, median: 25, high: 40 } },
    'mid': { 'us': { low: 45, median: 65, high: 90 }, 'uk': { low: 35, median: 55, high: 75 }, 'eu': { low: 35, median: 55, high: 75 }, 'asia': { low: 18, median: 30, high: 50 }, 'latam': { low: 22, median: 40, high: 60 }, 'africa': { low: 18, median: 30, high: 45 }, 'remote-global': { low: 25, median: 45, high: 70 } },
    'senior': { 'us': { low: 75, median: 110, high: 150 }, 'uk': { low: 60, median: 90, high: 125 }, 'eu': { low: 60, median: 90, high: 125 }, 'asia': { low: 30, median: 55, high: 80 }, 'latam': { low: 40, median: 65, high: 95 }, 'africa': { low: 30, median: 55, high: 75 }, 'remote-global': { low: 45, median: 80, high: 115 } },
    'expert': { 'us': { low: 110, median: 160, high: 220 }, 'uk': { low: 90, median: 130, high: 180 }, 'eu': { low: 90, median: 130, high: 180 }, 'asia': { low: 45, median: 80, high: 120 }, 'latam': { low: 60, median: 95, high: 140 }, 'africa': { low: 45, median: 80, high: 110 }, 'remote-global': { low: 70, median: 115, high: 165 } }
  }
};

const TASK_COMPLEXITY_HOURS: Record<string, { low: number; median: number; high: number }> = {
  'user-auth-system': { low: 8, median: 16, high: 32 },
  'payment-integration': { low: 12, median: 24, high: 48 },
  'seo-optimization': { low: 4, median: 12, high: 30 },
  'cms-integration': { low: 6, median: 12, high: 24 },
  'api-integration': { low: 8, median: 20, high: 40 },
  'responsive-design': { low: 4, median: 8, high: 16 },
  'animation-effects': { low: 2, median: 6, high: 16 },
  'database-design': { low: 8, median: 20, high: 40 },
  'email-system': { low: 4, median: 8, high: 16 },
  'search-functionality': { low: 6, median: 16, high: 32 },
  'social-media-feed': { low: 2, median: 6, high: 12 },
  'admin-dashboard': { low: 16, median: 40, high: 80 },
  'default': { low: 4, median: 10, high: 20 }
};

export function getMarketBenchmark(
  skillCategory: string,
  experienceLevel: string,
  region: string,
  currency: string = 'USD'
): RateBenchmark {
  const category = MARKET_RATES[skillCategory] || MARKET_RATES['web-dev'];
  const level = category[experienceLevel] || category['mid'];
  const regionData = level[region] || level['remote-global'];
  
  return {
    taskType: skillCategory,
    marketLow: regionData.low,
    marketMedian: regionData.median,
    marketHigh: regionData.high,
    region,
    experienceLevel,
    currency,
    source: 'ai-knowledge',
    lastUpdated: new Date().toISOString()
  };
}

export function estimateTaskCost(
  changeRequestText: string,
  settings: AppSettings
): { low: number; median: number; high: number; hours: { low: number; median: number; high: number }; reasoning: string } {
  
  const customRate = settings.customRates.find(r => 
    fuzzyMatchTaskType(r.taskType, changeRequestText)
  );
  
  if (customRate) {
    if (customRate.rateType === 'fixed') {
      return {
        low: customRate.rateValue * 0.9,
        median: customRate.rateValue,
        high: customRate.rateValue * 1.1,
        hours: { low: 0, median: 0, high: 0 },
        reasoning: `Based on your custom fixed rate for "${customRate.taskType}"`
      };
    } else {
      const hours = customRate.estimatedHours || 10;
      return {
        low: Math.round(customRate.rateValue * hours * 0.9),
        median: Math.round(customRate.rateValue * hours),
        high: Math.round(customRate.rateValue * hours * 1.2),
        hours: { low: Math.round(hours * 0.8), median: hours, high: Math.round(hours * 1.3) },
        reasoning: `Based on your custom hourly rate ($${customRate.rateValue}/hr) × ${hours} estimated hours`
      };
    }
  }
  
  const benchmark = getMarketBenchmark(settings.skillCategory, settings.experienceLevel, settings.region, settings.currency);
  const effectiveRate = settings.hourlyRate || benchmark.marketMedian;
  
  const clampedRate = Math.max(benchmark.marketLow * 0.7, Math.min(effectiveRate, benchmark.marketHigh * 1.3));
  
  const taskKey = detectTaskType(changeRequestText);
  const hours = TASK_COMPLEXITY_HOURS[taskKey] || TASK_COMPLEXITY_HOURS['default'];
  
  const costLow = Math.round(hours.low * clampedRate);
  const costMedian = Math.round(hours.median * clampedRate);
  const costHigh = Math.round(hours.high * clampedRate);
  
  const maxSpread = costMedian * 1.5;
  const finalHigh = Math.min(costHigh, maxSpread);
  
  return {
    low: costLow,
    median: costMedian,
    high: finalHigh,
    hours,
    reasoning: `Estimated ${hours.median} hours at $${clampedRate}/hr (${settings.experienceLevel} ${settings.skillCategory} in ${settings.region}). Range accounts for implementation uncertainty.`
  };
}

function detectTaskType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('auth') || lower.includes('login') || lower.includes('signup') || lower.includes('user system')) return 'user-auth-system';
  if (lower.includes('payment') || lower.includes('stripe') || lower.includes('checkout') || lower.includes('billing')) return 'payment-integration';
  if (lower.includes('seo') || lower.includes('google') || lower.includes('rank') || lower.includes('search engine')) return 'seo-optimization';
  if (lower.includes('cms') || lower.includes('content management') || lower.includes('wordpress') || lower.includes('strapi')) return 'cms-integration';
  if (lower.includes('api') || lower.includes('integration') || lower.includes('sync') || lower.includes('webhook')) return 'api-integration';
  if (lower.includes('responsive') || lower.includes('mobile') || lower.includes('tablet')) return 'responsive-design';
  if (lower.includes('animation') || lower.includes('motion') || lower.includes('transition')) return 'animation-effects';
  if (lower.includes('database') || lower.includes('db') || lower.includes('schema')) return 'database-design';
  if (lower.includes('email') || lower.includes('newsletter') || lower.includes('smtp')) return 'email-system';
  if (lower.includes('search') || lower.includes('filter') || lower.includes('sort')) return 'search-functionality';
  if (lower.includes('instagram') || lower.includes('social') || lower.includes('facebook') || lower.includes('twitter')) return 'social-media-feed';
  if (lower.includes('admin') || lower.includes('dashboard') || lower.includes('analytics')) return 'admin-dashboard';
  return 'default';
}

function fuzzyMatchTaskType(customType: string, requestText: string): boolean {
  const custom = customType.toLowerCase().replace(/[^a-z0-9]/g, '');
  const request = requestText.toLowerCase();
  return custom.split(' ').some(word => request.includes(word)) || 
         request.includes(customType.toLowerCase());
}
