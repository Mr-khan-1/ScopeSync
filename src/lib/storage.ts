import { ScopePage, ChangeRequest, AppSettings } from './types';

const STORAGE_KEY = 'scopesync_data';
const CURRENT_VERSION = '1.0';

export interface ScopeSyncData {
  version: string;
  scopes: ScopePage[];
  changeRequests: ChangeRequest[];
  settings: AppSettings;
  stats: {
    totalScopesCreated: number;
    totalLocked: number;
    totalChangeRequests: number;
  };
}

const defaultSettings: AppSettings = {
  businessType: 'freelancer',
  freelancerName: 'Freelancer',
  freelancerEmail: '',
  defaultCurrency: 'USD',
  rateMode: 'hourly',
  hourlyRate: 75,
  currency: 'USD',
  skillCategory: 'web-dev',
  experienceLevel: 'mid',
  region: 'us',
  customRates: []
};

function getDefaultData(): ScopeSyncData {
  return {
    version: CURRENT_VERSION,
    scopes: [],
    changeRequests: [],
    settings: defaultSettings,
    stats: {
      totalScopesCreated: 0,
      totalLocked: 0,
      totalChangeRequests: 0
    }
  };
}

export function getAllData(): ScopeSyncData {
  if (typeof window === 'undefined') return getDefaultData();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultData();
    
    const parsed = JSON.parse(data);
    if (parsed.version !== CURRENT_VERSION) {
      // In a real app we'd migrate, here we just return default or merge
      return { ...getDefaultData(), ...parsed, version: CURRENT_VERSION };
    }
    return parsed;
  } catch (error) {
    console.error('Failed to get scopesync data', error);
    return getDefaultData();
  }
}

export function saveData(data: ScopeSyncData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save scopesync data', error);
    throw new Error('Storage full or unavailable');
  }
}

// Scopes
export function getScopes(): ScopePage[] {
  return getAllData().scopes;
}

export function getScope(id: string): ScopePage | undefined {
  return getScopes().find(s => s.id === id);
}

export function getScopeByToken(shareToken: string): ScopePage | undefined {
  return getScopes().find(s => s.shareToken === shareToken);
}

export function saveScope(scope: ScopePage): void {
  const data = getAllData();
  const index = data.scopes.findIndex(s => s.id === scope.id);
  
  if (index >= 0) {
    data.scopes[index] = scope;
  } else {
    data.scopes.push(scope);
    data.stats.totalScopesCreated++;
  }
  
  if (scope.status === 'locked' && index >= 0 && data.scopes[index].status !== 'locked') {
    data.stats.totalLocked++;
  }
  
  saveData(data);
}

export function deleteScope(id: string): void {
  const data = getAllData();
  data.scopes = data.scopes.filter(s => s.id !== id);
  data.changeRequests = data.changeRequests.filter(r => r.scopeId !== id);
  saveData(data);
}

// Change Requests
export function getAllRequests(): ChangeRequest[] {
  return getAllData().changeRequests;
}

export function getRequests(scopeId: string): ChangeRequest[] {
  return getAllData().changeRequests
    .filter(req => req.scopeId === scopeId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveRequest(request: ChangeRequest): void {
  const data = getAllData();
  const index = data.changeRequests.findIndex(r => r.id === request.id);
  
  if (index >= 0) {
    data.changeRequests[index] = request;
  } else {
    data.changeRequests.push(request);
    data.stats.totalChangeRequests++;
  }
  
  saveData(data);
}

// Settings
export function getSettingsFromStorage(): AppSettings {
  return getAllData().settings;
}

export function saveSettings(settings: AppSettings): void {
  const data = getAllData();
  data.settings = settings;
  saveData(data);
}

export function addChangeOrder(scopeId: string, changeOrder: import('./types').ChangeOrder): void {
  const data = getAllData();
  const scope = data.scopes.find(s => s.id === scopeId);
  if (!scope) throw new Error('Scope not found');
  if (scope.status !== 'locked') throw new Error('Can only add change orders to locked scopes');
  
  if (!scope.changeOrders) scope.changeOrders = [];
  scope.changeOrders.push(changeOrder);
  saveData(data);
}
