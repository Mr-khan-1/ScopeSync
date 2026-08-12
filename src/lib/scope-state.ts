import { ScopePage } from './types';

export function canTransitionTo(scope: ScopePage, targetStatus: ScopePage['status']): boolean {
  switch (scope.status) {
    case 'draft':
      return targetStatus === 'freelancer_review';
    
    case 'freelancer_review':
      if (targetStatus !== 'client_review') return false;
      // All remaining items must have freelancerApproved !== null
      return scope.items.every(item => item.freelancerApproved !== null);
    
    case 'client_review':
      if (targetStatus === 'freelancer_review') return true; // Client rejected something
      if (targetStatus !== 'locked') return false;
      // All remaining items must have clientApproved === true
      return scope.items.every(item => item.clientApproved === true);
    
    case 'locked':
      return targetStatus === 'archived';
      
    case 'archived':
      return false; // Terminal state
      
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
    // Generate share token if it doesn't exist
    if (!updatedScope.shareToken) {
      updatedScope.shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    // Remove items that the freelancer rejected
    updatedScope.items = updatedScope.items.filter(item => item.freelancerApproved !== false);
  }
  
  return updatedScope;
}

export function lockScope(scope: ScopePage): ScopePage {
  if (!canTransitionTo(scope, 'locked')) {
    throw new Error('Cannot lock scope: pending client approvals.');
  }
  
  return {
    ...scope,
    status: 'locked',
    lockedAt: new Date().toISOString(),
    // Remove any items the client rejected, though they shouldn't exist if canTransitionTo passed
    items: scope.items.filter(item => item.clientApproved === true)
  };
}

export function isScopeLocked(scope: ScopePage): boolean {
  return scope.status === 'locked' || scope.status === 'archived';
}
