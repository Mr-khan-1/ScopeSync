import { z } from 'zod';

// Schema for what the AI returns
export const AIScopeSchema = z.object({
  title: z.string(),
  items: z.array(z.object({
    text: z.string(),
    category: z.enum(['in-scope', 'out-of-scope', 'assumption'])
  })),
  timeline: z.string().optional(),
  revisionPolicy: z.string().optional(),
});

export type AIScope = z.infer<typeof AIScopeSchema>;

// Schema for application storage (adds IDs and metadata)
export const ScopeItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  category: z.enum(['in-scope', 'out-of-scope', 'assumption'])
});

export type ScopeItem = z.infer<typeof ScopeItemSchema>;

export const ScopeSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  clientName: z.string().optional(),
  freelancerName: z.string().optional(),
  items: z.array(ScopeItemSchema),
  timeline: z.string().optional(),
  revisionPolicy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Scope = z.infer<typeof ScopeSchema>;

// Schema for AI change request evaluation
export const AIChangeRequestSchema = z.object({
  verdict: z.enum(['in-scope', 'out-of-scope']),
  reasoning: z.string(),
  cost: z.enum(['low', 'medium', 'high']),
  suggestedFee: z.string(),
  timelineImpact: z.string(),
  replyTemplate: z.string()
});

export type AIChangeRequest = z.infer<typeof AIChangeRequestSchema>;

// Schema for application storage of change requests
export const ChangeRequestSchema = z.object({
  id: z.string().uuid(),
  scopeId: z.string().uuid(),
  requestText: z.string(),
  analysis: AIChangeRequestSchema,
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: z.string()
});

export type ChangeRequest = z.infer<typeof ChangeRequestSchema>;
