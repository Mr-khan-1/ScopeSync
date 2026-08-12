import { describe, it, expect } from 'vitest';
import { lockScope, canTransitionTo } from '../src/lib/scope-state';
import { ScopePage } from '../src/lib/types';

describe('Scope State Transitions', () => {
  const mockScope: ScopePage = {
    id: '123',
    title: 'Test',
    status: 'client_signed',
    createdAt: new Date().toISOString(),
    lockedAt: null,
    freelancerName: 'John',
    clientName: 'Jane',
    clientEmail: 'jane@example.com',
    shareToken: 'abc',
    viewCount: 0,
    budgetType: 'hourly',
    currency: 'USD',
    clientSignature: { signerName: 'Jane', signedAt: new Date().toISOString() },
    items: [
      { id: '1', text: 'Item 1', category: 'in-scope', freelancerApproved: true, clientApproved: true },
    ]
  };

  it('allows transition to locked when client has signed', () => {
    expect(canTransitionTo(mockScope, 'locked')).toBe(true);
  });

  it('requires signature to lock scope', () => {
    const signature = {
      signerName: 'Jane',
      type: 'freelancer' as const,
      signedAt: new Date().toISOString()
    };
    
    const locked = lockScope(mockScope, signature);
    expect(locked.status).toBe('locked');
    expect(locked.signature).toEqual(signature);
  });
});
