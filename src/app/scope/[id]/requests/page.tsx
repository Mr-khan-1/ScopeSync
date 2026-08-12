'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getScope, getRequests, saveRequest, addChangeOrder } from '@/lib/storage';
import { ScopePage, ChangeRequest, ChangeOrder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, X, HandCoins, AlertCircle, Clock, Send, DollarSign, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ScopeRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const [scope, setScope] = useState<ScopePage | null>(null);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom price tracking per request id
  const [customPrices, setCustomPrices] = useState<Record<string, { value: string, isHourly: boolean, hours: string }>>({});
  const [activeCounterId, setActiveCounterId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof params.id === 'string') {
      const found = getScope(params.id);
      if (found) {
        setScope(found);
        setRequests(getRequests(found.id));
      }
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!scope || scope.status !== 'locked') {
    return (
      <div className="text-center py-20 space-y-4 animate-in fade-in">
        <h1 className="text-3xl font-bold">Dashboard Unavailable</h1>
        <p className="text-white/50 font-light">Change requests are only available for locked scopes.</p>
        <Button variant="outline" onClick={() => router.push('/')} className="mt-4 border-white/20">Return Home</Button>
      </div>
    );
  }

  const handleCounterOffer = (request: ChangeRequest) => {
    const priceState = customPrices[request.id];
    if (!priceState || !priceState.value) {
      toast.error("Please enter a custom price");
      return;
    }
    
    const val = parseFloat(priceState.value);
    if (isNaN(val)) {
      toast.error("Invalid price amount");
      return;
    }
    
    const offer = priceState.isHourly ? val * (parseFloat(priceState.hours) || 1) : val;
    const updated = { ...request, status: 'countered' as any, freelancerCounterOffer: offer, resolvedAt: new Date().toISOString() };
    
    saveRequest(updated);
    setRequests(prev => prev.map(r => r.id === request.id ? updated : r));
    toast.success("Counter-offer sent to client");
    setActiveCounterId(null);
  };

  const handleApproveChange = (request: ChangeRequest, price: number) => {
    const updated = { ...request, status: 'approved' as any, resolvedAt: new Date().toISOString() };
    saveRequest(updated);
    setRequests(prev => prev.map(r => r.id === request.id ? updated : r));

    // Automatically add to scope change orders
    const changeOrder: ChangeOrder = {
      id: Math.random().toString(36).substring(2, 15),
      requestText: request.requestText,
      description: request.requestText,
      approvedPrice: price,
      approvedAt: new Date().toISOString(),
      originalRequestId: request.id
    };
    
    try {
      addChangeOrder(scope.id, changeOrder);
      toast.success("Change approved and added to scope budget");
    } catch (e: any) {
      toast.error("Approved, but failed to update scope: " + e.message);
    }
  };

  const handleDeclineChange = (request: ChangeRequest) => {
    const updated = { ...request, status: 'declined' as any, resolvedAt: new Date().toISOString() };
    saveRequest(updated);
    setRequests(prev => prev.map(r => r.id === request.id ? updated : r));
    toast.success("Request declined");
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const resolvedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen opacity-50" />
      
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push(`/scope/${scope.id}`)} className="rounded-full border-white/10 hover:bg-white/10">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Change Requests</h1>
          <p className="text-white/50 text-sm">{scope.title}</p>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" /> Pending Action ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <div className="glass-card rounded-[2rem] border-dashed border-white/20 p-12 text-center text-white/50">
            No pending change requests.
          </div>
        ) : (
          <div className="space-y-6">
            {pendingRequests.map(req => (
              <div key={req.id} className="glass-card rounded-[2rem] overflow-hidden border-white/10">
                <div className="p-6 md:p-8 space-y-6">
                  
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="text-sm text-white/40 mb-1">{req.clientName} requested on {new Date(req.createdAt).toLocaleDateString()}</div>
                      <p className="text-lg font-medium text-white/90">"{req.requestText}"</p>
                    </div>
                    <div className={`px-3 py-1 text-xs font-bold rounded-full border ${req.aiAnalysis.verdict === 'in-scope' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                      {req.aiAnalysis.verdict === 'in-scope' ? 'IN SCOPE' : 'OUT OF SCOPE'}
                    </div>
                  </div>

                  {req.aiAnalysis.verdict === 'out-of-scope' && (
                    <div className="grid md:grid-cols-2 gap-6 bg-black/20 rounded-2xl p-6 border border-white/5">
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider">AI Estimate</h4>
                        <div className="space-y-2 text-sm text-white/80">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-white/60">Conservative:</span>
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded">${req.aiAnalysis.estimatedCostLow}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-y border-white/5">
                            <span className="text-primary font-medium">Standard (Median):</span>
                            <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">${req.aiAnalysis.estimatedCostMedian}</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-white/60">Maximum:</span>
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded">${req.aiAnalysis.estimatedCostHigh}</span>
                          </div>
                        </div>
                        <div className="text-xs text-white/40 pt-2 border-t border-white/5">
                          Timeline impact: {req.aiAnalysis.timelineImpact}
                        </div>
                      </div>

                      {req.aiAnalysis.marketBenchmark && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Market Context</h4>
                          <p className="text-sm text-white/60 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                            Market Range: <strong className="text-white">${req.aiAnalysis.marketBenchmark.low}–${req.aiAnalysis.marketBenchmark.high}/hr</strong>
                            <br/>
                            This analysis uses your configured rate to determine standard cost.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-sm text-white/80 leading-relaxed">
                    <strong className="text-primary">AI Reasoning:</strong> {req.aiAnalysis.reasoning}
                  </div>

                  {activeCounterId === req.id ? (
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4 animate-in zoom-in-95">
                      <h4 className="font-semibold text-white">Set Custom Price</h4>
                      <div className="flex items-center gap-4">
                        <div className="space-y-2 flex-1">
                          <label className="text-xs text-white/60">Price Amount ($)</label>
                          <Input 
                            type="number" 
                            className="bg-black/50 border-white/10" 
                            placeholder={req.aiAnalysis.estimatedCostMedian.toString()}
                            value={customPrices[req.id]?.value || ''}
                            onChange={(e) => setCustomPrices({...customPrices, [req.id]: {...(customPrices[req.id] || {isHourly: false, hours: ''}), value: e.target.value}})}
                          />
                        </div>
                        <Button 
                          onClick={() => handleCounterOffer(req)}
                          className="mt-6 bg-primary hover:bg-primary/90 text-white"
                        >
                          Send Counter <Send className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="ghost" onClick={() => setActiveCounterId(null)} className="mt-6">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
                      {req.aiAnalysis.verdict === 'in-scope' ? (
                        <Button onClick={() => handleApproveChange(req, 0)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                          <Check className="w-4 h-4 mr-2" /> Approve (No Charge)
                        </Button>
                      ) : (
                        <>
                          <Button onClick={() => setActiveCounterId(req.id)} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                            <HandCoins className="w-4 h-4 mr-2" /> Set Price & Counter
                          </Button>
                          <Button onClick={() => {
                             setCustomPrices({...customPrices, [req.id]: {value: req.aiAnalysis.estimatedCostMedian.toString(), isHourly: false, hours: ''}});
                             const updated = { ...req, status: 'countered' as any, freelancerCounterOffer: req.aiAnalysis.estimatedCostMedian, resolvedAt: new Date().toISOString() };
                             saveRequest(updated);
                             setRequests(prev => prev.map(r => r.id === req.id ? updated : r));
                             toast.success("Counter-offer sent to client");
                          }} variant="outline" className="rounded-xl border-white/20">
                            Use AI Median (${req.aiAnalysis.estimatedCostMedian})
                          </Button>
                        </>
                      )}
                      <Button onClick={() => handleDeclineChange(req)} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl ml-auto">
                        <X className="w-4 h-4 mr-2" /> Decline
                      </Button>
                    </div>
                  )}
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-8 pt-8 border-t border-white/10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Resolved ({resolvedRequests.length})
        </h2>
        
        {resolvedRequests.length === 0 ? (
          <div className="text-white/40 text-sm">No resolved requests yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {resolvedRequests.map(req => (
              <div key={req.id} className="glass-card rounded-2xl p-5 border-white/5 opacity-80">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm font-medium line-clamp-2">"{req.requestText}"</p>
                  <div className={`text-xs px-2 py-0.5 rounded-full border ${req.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : req.status === 'countered' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {req.status.toUpperCase()}
                  </div>
                </div>
                {req.freelancerCounterOffer && (
                  <div className="text-xs text-white/50 bg-black/20 p-2 rounded-lg mt-2 flex items-center gap-2">
                    <DollarSign className="w-3 h-3 text-primary" /> Priced at ${req.freelancerCounterOffer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
