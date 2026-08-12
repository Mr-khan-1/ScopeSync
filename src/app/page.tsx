'use client';

import { useEffect, useState } from 'react';
import { getScopes, deleteScope, getAllRequests } from '@/lib/storage';
import { ScopePage, ChangeRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight, PlusCircle, Trash2, ShieldCheck, Activity, CalendarDays, Inbox } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [scopes, setScopes] = useState<ScopePage[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setScopes(getScopes().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setRequests(getAllRequests());
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    deleteScope(id);
    setScopes(scopes.filter(s => s.id !== id));
    toast.success('Scope deleted successfully');
  };

  const calculateDebt = () => {
    let allTime = 0;
    let thisMonth = 0;
    const now = new Date();
    
    requests.forEach(req => {
      // If approved, we count the freelancerCounterOffer if they countered, otherwise the AI median.
      // If it was countered and then 'approved' by the client (though the state is just 'countered' waiting for client payment IRL, let's treat countered as 'locked in' for dashboard logic, or only 'approved'/'countered')
      if (req.status === 'approved' || req.status === 'countered') {
        const val = req.freelancerCounterOffer || req.aiAnalysis.estimatedCostMedian;
        allTime += val;
        
        if (new Date(req.createdAt).getMonth() === now.getMonth() && new Date(req.createdAt).getFullYear() === now.getFullYear()) {
          thisMonth += val;
        }
      }
    });
    
    return { allTime, thisMonth };
  };

  const { allTime, thisMonth } = calculateDebt();

  if (loading) return null;

  const drafts = scopes.filter(s => s.status === 'freelancer_review' || s.status === 'draft');
  const pendingClient = scopes.filter(s => s.status === 'client_review');
  const locked = scopes.filter(s => s.status === 'locked');

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen opacity-50" />

      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_15px_rgba(200,100,255,0.2)] mb-2">
            Welcome back, Freelancer
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            Your Active Boundaries
          </h1>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light">
            Manage your project scopes. Keep clients happy and eliminate unpaid favors before they happen.
          </p>
        </div>
        
        <div className="glass-card rounded-3xl p-6 w-full md:w-80 flex-shrink-0 animate-in zoom-in-95 duration-1000 delay-150 fill-mode-both">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-green-500/20 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <ShieldCheck className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Scope Debt Prevented</h2>
          </div>
          <div className="text-5xl font-bold text-white mb-3 tracking-tighter drop-shadow-md">${allTime.toLocaleString()}</div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20 w-fit px-3 py-1.5 rounded-full shadow-inner">
            <Activity className="w-3.5 h-3.5" />
            <span>+${thisMonth.toLocaleString()} this month</span>
          </div>
        </div>
      </section>

      {scopes.length === 0 ? (
        <div className="glass-card rounded-[2.5rem] border-dashed border-white/20 p-16 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-2 shadow-inner border border-white/10">
            <PlusCircle className="w-10 h-10 text-white/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">No scopes yet</h3>
            <p className="text-white/50 max-w-sm mx-auto text-lg font-light">Create your first scope agreement to start protecting your time and income.</p>
          </div>
          <Link href="/scope/new">
            <Button className="mt-4 bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95 transition-all rounded-full px-8 py-6 text-lg font-medium shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Create your first scope
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Active Locked Scopes */}
          {locked.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" /> Locked Contracts
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {locked.map((scope, i) => (
                  <ScopeCard key={scope.id} scope={scope} index={i} requests={requests} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {/* Pending Client Review */}
          {pendingClient.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-amber-400">
                <Activity className="w-5 h-5" /> Awaiting Client Review
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingClient.map((scope, i) => (
                  <ScopeCard key={scope.id} scope={scope} index={i} requests={requests} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {/* Drafts */}
          {drafts.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white/70">
                <CalendarDays className="w-5 h-5" /> Drafts & Needs Your Review
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {drafts.map((scope, i) => (
                  <ScopeCard key={scope.id} scope={scope} index={i} requests={requests} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}

function ScopeCard({ scope, index, requests, onDelete }: { scope: ScopePage, index: number, requests: ChangeRequest[], onDelete: (id: string) => void }) {
  const pendingRequests = requests.filter(r => r.scopeId === scope.id && r.status === 'pending');
  
  return (
    <div 
      className="glass-card rounded-3xl p-6 flex flex-col group h-full animate-in fade-in zoom-in-95 fill-mode-both border-white/10"
      style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
    >
      <div className="flex justify-between items-start mb-8">
        <div className={`p-3 rounded-2xl group-hover:scale-110 transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ${
          scope.status === 'locked' ? 'bg-emerald-500/10 text-emerald-400' :
          scope.status === 'client_review' ? 'bg-amber-500/10 text-amber-400' :
          'bg-primary/10 text-primary'
        }`}>
          {scope.status === 'locked' ? <ShieldCheck className="w-6 h-6" /> : <CalendarDays className="w-6 h-6" />}
        </div>
        <button 
          onClick={() => onDelete(scope.id)}
          className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <h3 className="text-2xl font-bold mb-2 line-clamp-1 group-hover:text-glow transition-all">{scope.title}</h3>
      <p className="text-white/50 text-sm mb-6 flex-1 font-light">
        {scope.clientName ? `Client: ${scope.clientName}` : 'No client specified'}
      </p>

      {scope.status === 'locked' && pendingRequests.length > 0 && (
        <Link href={`/scope/${scope.id}/requests`} className="mb-6">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-3 flex items-center justify-between hover:bg-amber-500/20 transition-colors">
            <span className="flex items-center gap-2 text-sm font-medium"><Inbox className="w-4 h-4" /> {pendingRequests.length} Pending Change Request(s)</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>
      )}

      <div className="flex items-center gap-5 text-sm font-medium bg-black/20 border border-white/5 rounded-2xl p-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-white/80">{scope.items.filter((i: any) => i.category === 'in-scope').length} In</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
          <span className="text-white/80">{scope.items.filter((i: any) => i.category === 'out-of-scope').length} Out</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/scope/${scope.id}`} className="block w-full">
          <Button variant="outline" className="w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(200,100,255,0.3)] py-6 text-sm">
            View Agreement
          </Button>
        </Link>
        {scope.status === 'locked' && (
          <Link href={`/scope/${scope.id}/requests`} className="block">
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all py-6 px-4" title="Change Requests Dashboard">
              <Activity className="w-5 h-5 text-white/70" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
