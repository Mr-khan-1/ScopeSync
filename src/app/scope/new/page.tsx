'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { saveScope } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export default function NewScopePage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!text.trim()) {
      setError('Please paste a project brief first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/extract-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to extract scope');
      }

      const aiScope = await res.json();
      
      const newScope = {
        ...aiScope,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        status: 'freelancer_review', // Transitioned immediately from draft
        lockedAt: null,
        freelancerName: 'Freelancer',
        clientName: 'Client',
        clientEmail: '',
        shareToken: '',
        viewCount: 0,
        items: aiScope.items.map((item: any) => ({
          ...item,
          id: uuidv4(),
          freelancerApproved: null,
          clientApproved: null
        }))
      };

      saveScope(newScope);
      toast.success('Scope extracted! Please review items.');
      router.push(`/scope/${newScope.id}`);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during extraction.');
      toast.error('Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen opacity-60" />
      
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_15px_rgba(200,100,255,0.2)] mb-2">
          AI-Powered Extraction
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
          Paste the Mess. <br/> Get the Boundary.
        </h1>
        <p className="text-lg text-white/60 font-light max-w-xl mx-auto">
          Paste your client's emails, Upwork posts, or messy Slack threads below. Our AI will instantly structure it into a clear, professional agreement.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-2 shadow-2xl relative">
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="brief" className="text-lg font-medium text-white/80 flex items-center gap-2">
              Project Brief or Communication
            </Label>
            <Textarea
              id="brief"
              placeholder="e.g. 'I need a landing page designed with 4 sections. No logo design needed right now, just use placeholder. Must be done by next Friday. I also might want a contact form if it fits the budget...'"
              className="min-h-[250px] resize-y bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-2xl p-6 text-lg focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all shadow-inner leading-relaxed"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium leading-relaxed">{error}</p>
            </div>
          )}
        </div>
        
        <div className="p-6 md:p-8 pt-0 flex justify-end">
          <Button
            onClick={handleExtract}
            disabled={loading || !text.trim()}
            className="w-full md:w-auto h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-lg shadow-[0_0_30px_rgba(200,100,255,0.3)] hover:shadow-[0_0_40px_rgba(200,100,255,0.5)] transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50 group"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Analyzing Scope...
              </>
            ) : (
              <>
                <Sparkles className="mr-3 h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
                Extract Structure
                <ArrowRight className="ml-3 h-5 w-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
