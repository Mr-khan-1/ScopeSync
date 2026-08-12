import { ScopePage } from './types';

export function canTransitionTo(scope: ScopePage, targetStatus: ScopePage['status']): boolean {
  switch (scope.status) {
    case 'draft':
      return targetStatus === 'freelancer_review';
    
    case 'freelancer_review':
      if (targetStatus !== 'client_review') return false;
      return scope.items.every(item => item.freelancerApproved !== null);
    
    case 'client_review':
      if (targetStatus === 'freelancer_review') return true;
      if (targetStatus === 'client_signed') {
        return scope.items.every(item => item.clientApproved === true);
      }
      return false;
    
    case 'client_signed':
      if (targetStatus !== 'locked') return false;
      return !!scope.clientSignature;
    
    case 'locked':
      return targetStatus === 'archived';
      
    case 'archived':
      return false;
      
    default:
      return false;
  }
}

export function transitionScope(scope: ScopePage, targetStatus: ScopePage['status']): ScopePage {
  if (!canTransitionTo(scope, targetStatus)) {
    throw new Error(`Invalid state transition from ${scope.status} to ${targetStatus}`);
  }
  
  const updatedScope = { ...scope, status: targetStatus };
  
  if (targetStatus === 'client_review') {
    if (!updatedScope.shareToken) {
      updatedScope.shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    updatedScope.items = updatedScope.items.filter(item => item.freelancerApproved !== false);
  }
  
  if (targetStatus === 'freelancer_review') {
    updatedScope.items = updatedScope.items.map(item => ({
      ...item,
      clientApproved: null
    }));
  }
  
  return updatedScope;
}

export function clientSignScope(scope: ScopePage, signature: ScopePage['clientSignature']): ScopePage {
  if (scope.status !== 'client_review') {
    throw new Error('Scope must be in client review for client to sign.');
  }
  if (!scope.items.every(item => item.clientApproved === true)) {
    throw new Error('Client must approve all items before signing.');
  }
  if (!signature || !signature.signerName.trim()) {
    throw new Error('Client name is required to sign.');
  }
  
  return {
    ...scope,
    status: 'client_signed',
    clientSignature: signature,
    items: scope.items.filter(item => item.clientApproved === true)
  };
}

export function lockScope(scope: ScopePage, signature: ScopePage['signature']): ScopePage {
  if (scope.status !== 'client_signed') {
    throw new Error('Client must sign before freelancer can finalize.');
  }
  if (!signature || !signature.signerName.trim()) {
    throw new Error('Freelancer name is required to sign.');
  }
  
  return {
    ...scope,
    status: 'locked',
    lockedAt: new Date().toISOString(),
    signature,
    items: scope.items.filter(item => item.clientApproved === true)
  };
}

export function isScopeLocked(scope: ScopePage): boolean {
  return scope.status === 'locked' || scope.status === 'archived';
}

export function getScopeStatusLabel(status: ScopePage['status']): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    freelancer_review: 'Freelancer Review',
    client_review: 'Client Review',
    client_signed: 'Client Signed — Awaiting Freelancer',
    locked: 'Locked & Active',
    archived: 'Archived'
  };
  return labels[status] || status;
}
