'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getScope, getScopeByToken, saveScope, saveRequest, getSettingsFromStorage } from '@/lib/storage';
import { ScopePage, ScopeItem, ChangeRequest } from '@/lib/types';
import { transitionScope, lockScope, clientSignScope, getScopeStatusLabel } from '@/lib/scope-state';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, HelpCircle, Calendar, Clock, Share2, FileText, ArrowRight, Check, X, Send, DollarSign, Download, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { AppSettings } from '@/lib/types';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AgreementPDF } from '@/components/AgreementPDF';

export default function ScopePageViewer() {
  const params = useParams();
  const router = useRouter();
  const [scope, setScope] = useState<ScopePage | null>(null);
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientFeedback, setClientFeedback] = useState<Record<string, string>>({});
  
  // Change Request Form State
  const [isSubmittingCR, setIsSubmittingCR] = useState(false);
  const [crText, setCrText] = useState('');
  const [crName, setCrName] = useState('');
  const [crEmail, setCrEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // Signature State
  const [showClientSignPanel, setShowClientSignPanel] = useState(false);
  const [showFreelancerSignPanel, setShowFreelancerSignPanel] = useState(false);
  const [clientSignerName, setClientSignerName] = useState('');
  const [freelancerSignerName, setFreelancerSignerName] = useState('');

  useEffect(() => {
    if (typeof params.id === 'string') {
      let found = getScope(params.id);
      if (found) {
        setScope(found);
        setIsFreelancer(true);
      } else {
        found = getScopeByToken(params.id);
        if (found) {
          setScope(found);
          setIsFreelancer(false);
          
          // Increment view count for client
          if (found.status === 'client_review' || found.status === 'locked') {
            const updated = { ...found, viewCount: found.viewCount + 1, lastViewedAt: new Date().toISOString() };
            saveScope(updated);
            setScope(updated);
          }
        }
      }
    }
    setSettings(getSettingsFromStorage());
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!scope) {
    return (
      <div className="text-center py-20 space-y-4 animate-in fade-in">
        <h1 className="text-3xl font-bold">Scope not found</h1>
        <p className="text-white/50 font-light">This agreement may have expired or been deleted.</p>
      </div>
    );
  }

  const handleFreelancerApproval = (itemId: string, approved: boolean) => {
    const updatedItems = scope.items.map(item => 
      item.id === itemId ? { ...item, freelancerApproved: approved } : item
    );
    const updated = { ...scope, items: updatedItems };
    setScope(updated);
    saveScope(updated);
  };

  const handleClientApproval = (itemId: string, approved: boolean) => {
    const updatedItems = scope.items.map(item => 
      item.id === itemId ? { ...item, clientApproved: approved } : item
    );
    const updated = { ...scope, items: updatedItems };
    setScope(updated);
    saveScope(updated);
  };

  const handleBulkApproval = (category: string, approved: boolean) => {
    const isFreelancerTurn = scope.status === 'freelancer_review' && isFreelancer;
    const isClientTurn = scope.status === 'client_review' && !isFreelancer;
    
    if (!isFreelancerTurn && !isClientTurn) return;

    const updatedItems = scope.items.map(item => {
      if (item.category === category) {
        return isFreelancerTurn 
          ? { ...item, freelancerApproved: approved }
          : { ...item, clientApproved: approved };
      }
      return item;
    });
    const updated = { ...scope, items: updatedItems };
    setScope(updated);
    saveScope(updated);
  };

  const handleFreelancerSubmit = () => {
    try {
      const updated = transitionScope(scope, 'client_review');
      saveScope(updated);
      setScope(updated);
      toast.success('Scope ready for client review!');
    } catch (err: any) {
      toast.error(err.message || 'Please approve or reject all items first.');
    }
  };

  const handleClientSubmit = () => {
    const rejectedItems = scope.items.filter(i => i.clientApproved === false);
    if (rejectedItems.length > 0) {
      try {
        const updated = transitionScope(scope, 'freelancer_review');
        saveScope(updated);
        setScope(updated);
        toast.success('Feedback sent to freelancer for revision.');
      } catch (err: any) {
        toast.error(err.message);
      }
    } else {
      setShowClientSignPanel(true);
    }
  };

  const handleClientSign = () => {
    if (!clientSignerName.trim()) {
      toast.error('Please type your full name to sign.');
      return;
    }
    try {
      const signature = {
        signerName: clientSignerName.trim(),
        signedAt: new Date().toISOString(),
      };
      const updated = clientSignScope(scope, signature);
      saveScope(updated);
      setScope(updated);
      setShowClientSignPanel(false);
      toast.success('You have signed the agreement! Awaiting freelancer signature.');
    } catch (err: any) {
      toast.error(err.message || 'Unable to sign. Make sure all items are approved.');
    }
  };

  const handleFreelancerSign = () => {
    if (!freelancerSignerName.trim()) {
      toast.error('Please type your full name to sign.');
      return;
    }
    try {
      const signature = {
        signerName: freelancerSignerName.trim(),
        signedAt: new Date().toISOString(),
        type: settings?.businessType || 'freelancer',
        stampDataUrl: settings?.businessType === 'agency' ? settings.companyStampDataUrl : undefined
      };
      const updated = lockScope(scope, signature);
      saveScope(updated);
      setScope(updated);
      setShowFreelancerSignPanel(false);
      toast.success('Agreement locked! PDF is now available for download.');
    } catch (err: any) {
      toast.error(err.message || 'Please ensure client has signed first.');
    }
  };

  const handleSubmitChangeRequest = async () => {
    if (!crText.trim() || !crName.trim()) {
      toast.error('Please provide a description and your name.');
      return;
    }
    
    setIsSubmittingCR(true);
    
    try {
      const settings = getSettingsFromStorage();
      const res = await fetch('/api/analyze-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestText: crText,
          scope,
          settings: settings || getSettingsFromStorage(),
          clientName: crName,
          clientEmail: crEmail,
          apiKey: settings?.geminiApiKey
        })
      });
      
      if (!res.ok) throw new Error('Failed to analyze request');
      
      const { analysis } = await res.json();
      
      const newReq: ChangeRequest = {
        id: Math.random().toString(36).substring(2, 15),
        scopeId: scope.id,
        requestText: crText,
        clientName: crName,
        clientEmail: crEmail,
        aiAnalysis: analysis,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      saveRequest(newReq);
      toast.success('Change request submitted successfully!');
      setIsDialogOpen(false);
      setCrText('');
    } catch (err: any) {
      toast.error(err.message || 'Error submitting request');
    } finally {
      setIsSubmittingCR(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/scope/${scope.shareToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Client link copied to clipboard!');
  };

  const inScope = scope.items.filter(i => i.category === 'in-scope');
  const outOfScope = scope.items.filter(i => i.category === 'out-of-scope');
  const assumptions = scope.items.filter(i => i.category === 'assumption');

  const totalItems = scope.items.length;
  const freelancerDecided = scope.items.filter(i => i.freelancerApproved !== null).length;
  const clientDecided = scope.items.filter(i => i.clientApproved !== null).length;

  const renderApprovalButtons = (item: ScopeItem) => {
    if (scope.status === 'freelancer_review' && isFreelancer) {
      return (
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <button 
            onClick={() => handleFreelancerApproval(item.id, false)}
            className={`p-1.5 rounded-full transition-all ${item.freelancerApproved === false ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-red-500/10 text-red-500/40 hover:text-red-400 hover:bg-red-500/20 hover:scale-110'}`}
            aria-label="Reject item"
            title="Reject item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }
    
    if (scope.status === 'client_review' && !isFreelancer) {
      return (
        <div className="flex flex-col gap-3 ml-4 shrink-0 items-end">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleClientApproval(item.id, false)}
              className={`p-1.5 rounded-full transition-all ${item.clientApproved === false ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-red-500/10 text-red-500/40 hover:text-red-400 hover:bg-red-500/20 hover:scale-110'}`}
              aria-label="Reject item"
              title="Reject item"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {item.clientApproved === false && (
            <Textarea 
              placeholder="What should be changed?" 
              className="w-48 text-sm bg-black/40 border-white/10"
              value={clientFeedback[item.id] || ''}
              onChange={(e) => setClientFeedback({...clientFeedback, [item.id]: e.target.value})}
            />
          )}
        </div>
      );
    }
    return null;
  };

  const renderBulkApprovalButtons = (category: string) => {
    const isFreelancerTurn = scope.status === 'freelancer_review' && isFreelancer;
    const isClientTurn = scope.status === 'client_review' && !isFreelancer;
    
    if (!isFreelancerTurn && !isClientTurn) return null;

    const categoryItems = scope.items.filter(i => i.category === category);
    if (categoryItems.length === 0) return null;

    const allApproved = categoryItems.every(i => isFreelancerTurn ? i.freelancerApproved === true : i.clientApproved === true);
    const allRejected = categoryItems.every(i => isFreelancerTurn ? i.freelancerApproved === false : i.clientApproved === false);

    return (
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs font-medium text-white/50 mr-2 uppercase tracking-wider hidden sm:inline-block">Select All:</span>
        <button 
          onClick={() => handleBulkApproval(category, true)}
          className={`p-2 rounded-full transition-all ${allApproved ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white hover:scale-110'}`}
          title="Approve All"
          aria-label="Approve all items in this section"
        >
          <Check className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const getItemStyle = (item: ScopeItem) => {
    if (scope.status === 'freelancer_review' && item.freelancerApproved === false) return "opacity-40 line-through";
    if (scope.status === 'client_review' && item.clientApproved === false) return "opacity-40 line-through text-red-300";
    return "";
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen opacity-50" />

      {/* Action Bar (Sticky) */}
      {scope.status === 'freelancer_review' && isFreelancer && (
        <div className="sticky top-24 z-40 glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="text-primary font-bold">{freelancerDecided} / {totalItems}</div>
            <div className="text-sm text-white/60">items reviewed</div>
          </div>
          <Button 
            onClick={handleFreelancerSubmit} 
            disabled={freelancerDecided < totalItems}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-[0_0_20px_rgba(200,100,255,0.4)]"
          >
            Continue to Client Review <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}

      {scope.status === 'client_review' && !isFreelancer && (
        <div className="sticky top-24 z-40 glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="text-emerald-400 font-bold">{clientDecided} / {totalItems}</div>
            <div className="text-sm text-white/60">items reviewed</div>
          </div>
          <Button 
            onClick={handleClientSubmit} 
            disabled={clientDecided < totalItems}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            {scope.items.some(i => i.clientApproved === false) ? 'Send Revisions' : 'Approve All & Lock Scope'}
          </Button>
        </div>
      )}

      {/* Header section */}
      <div className="glass-card rounded-[2rem] p-8 md:p-12 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-4">
            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-[0_0_15px_rgba(200,100,255,0.2)] ${
              scope.status === 'locked' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
              scope.status === 'client_signed' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' :
              scope.status === 'client_review' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
              'border-primary/30 bg-primary/10 text-primary'
            }`}>
              {getScopeStatusLabel(scope.status)}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-md text-white">{scope.title}</h1>
            
            {scope.status === 'client_review' && !isFreelancer && (
              <p className="text-lg text-white/80 font-light max-w-2xl">
                Hi {scope.clientName}, please review and approve the project scope before {scope.freelancerName} begins work.
              </p>
            )}
            {scope.status === 'locked' && (
              <p className="text-lg text-emerald-400/80 font-medium">
                This scope was mutually agreed and locked on {new Date(scope.lockedAt!).toLocaleDateString()}.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 font-medium pt-2">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <FileText className="h-4 w-4 text-white/40" /> Client: {scope.clientName || 'Pending'}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <Calendar className="h-4 w-4 text-white/40" /> 
                Created: {new Date(scope.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            {isFreelancer && scope.shareToken && (
              <Button variant="outline" className="flex-1 md:flex-none glass border-white/20 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all rounded-full px-6 py-5" onClick={copyLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Copy Client Link
              </Button>
            )}
            {scope.status === 'locked' && (
              <>
                <PDFDownloadLink document={<AgreementPDF scope={scope} />} fileName={`ScopeSync_Agreement_${scope.id}.pdf`}>
                  {({ loading: pdfLoading }: any) => (
                    <Button variant="outline" className="flex-1 md:flex-none bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all rounded-full px-6 py-5" disabled={pdfLoading}>
                      <Download className="mr-2 h-4 w-4" />
                      {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger render={<Button variant="outline" className="flex-1 md:flex-none bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 hover:text-white transition-all rounded-full px-6 py-5" />}>
                  Request a Change
                </DialogTrigger>
                <DialogContent className="bg-card/40 backdrop-blur-xl border-white/10 sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Request a Scope Change</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Describe the change you'd like to make:</label>
                      <Textarea 
                        placeholder="e.g. Can we also add a blog section?" 
                        className="min-h-[120px] bg-black/40 border-white/10 focus-visible:ring-primary"
                        value={crText}
                        onChange={(e) => setCrText(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Your Name</label>
                        <Input 
                          placeholder="John Doe" 
                          className="bg-black/40 border-white/10 focus-visible:ring-primary"
                          value={crName}
                          onChange={(e) => setCrName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Your Email</label>
                        <Input 
                          placeholder="john@example.com" 
                          className="bg-black/40 border-white/10 focus-visible:ring-primary"
                          value={crEmail}
                          onChange={(e) => setCrEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSubmitChangeRequest}
                      disabled={isSubmittingCR}
                      className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl text-lg"
                    >
                      {isSubmittingCR ? 'Analyzing & Submitting...' : 'Submit Request'} <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {(scope.timeline || scope.revisionPolicy) && (
        <div className="grid gap-6 md:grid-cols-2">
          {scope.timeline && (
            <div className="glass-card bg-black/20 rounded-3xl p-6 flex items-start gap-5 group">
              <div className="p-3 bg-primary/10 rounded-2xl shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-inner">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white/80 text-sm tracking-wide uppercase">Estimated Timeline</h3>
                <p className="text-lg text-white mt-1 leading-snug font-light">{scope.timeline}</p>
              </div>
            </div>
          )}
          {scope.revisionPolicy && (
            <div className="glass-card bg-black/20 rounded-3xl p-6 flex items-start gap-5 group">
              <div className="p-3 bg-primary/10 rounded-2xl shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-inner">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white/80 text-sm tracking-wide uppercase">Revision Policy</h3>
                <p className="text-lg text-white mt-1 leading-snug font-light">{scope.revisionPolicy}</p>
              </div>
            </div>
          )}
          {scope.budgetType && (
            <div className="glass-card bg-black/20 rounded-3xl p-6 flex items-start gap-5 group">
              <div className="p-3 bg-primary/10 rounded-2xl shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-inner">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white/80 text-sm tracking-wide uppercase">Project Budget</h3>
                <p className="text-lg text-white mt-1 leading-snug font-light">
                  {scope.budgetType === 'hourly' ? `$${scope.hourlyRate}/hr` : `Fixed Total`}
                </p>
                {scope.budgetType === 'fixed_total' && scope.totalBudget && (
                  <p className="text-lg font-medium text-emerald-400 mt-1">
                    {scope.currency === 'PKR' ? 'Rs. ' : scope.currency === 'USD' ? '$' : scope.currency + ' '}
                    {scope.totalBudget.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showClientSignPanel && !isFreelancer && (
        <div className="glass-card p-6 mt-6 border-l-4 border-l-emerald-500">
          <h3 className="text-lg font-semibold text-white mb-2">Sign this Agreement</h3>
          <p className="text-sm text-slate-400 mb-4">
            By typing your name below, you confirm you have reviewed and approve all items in this scope.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="clientSignName" className="text-slate-300">Type your full name</Label>
              <Input
                id="clientSignName"
                value={clientSignerName}
                onChange={(e) => setClientSignerName(e.target.value)}
                placeholder="e.g. Sana Malik"
                className="mt-1.5 bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleClientSign} className="bg-emerald-600 hover:bg-emerald-700">
                Sign Agreement
              </Button>
              <Button variant="outline" onClick={() => setShowClientSignPanel(false)} className="border-slate-600 text-slate-300">
                Cancel
              </Button>
            </div>
            <p className="text-xs text-slate-500 italic">
              This is an informal agreement record for tracking purposes, not a certified legal e-signature.
            </p>
          </div>
        </div>
      )}

      {scope.status === 'client_signed' && isFreelancer && (
        <div className="glass-card p-6 mt-6 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Client Has Signed</h3>
              <p className="text-sm text-slate-400">
                {scope.clientSignature?.signerName} signed on {new Date(scope.clientSignature!.signedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {!showFreelancerSignPanel ? (
            <Button onClick={() => setShowFreelancerSignPanel(true)} className="bg-blue-600 hover:bg-blue-700">
              Sign to Finalize Agreement
            </Button>
          ) : (
            <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
              <div>
                <Label htmlFor="freelancerSignName" className="text-slate-300">Type your full name to finalize</Label>
                <Input
                  id="freelancerSignName"
                  value={freelancerSignerName}
                  onChange={(e) => setFreelancerSignerName(e.target.value)}
                  placeholder={settings?.freelancerName || 'Your name'}
                  className="mt-1.5 bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
              {settings?.businessType === 'agency' && settings.companyStampDataUrl && (
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <img src={settings.companyStampDataUrl} alt="Company stamp" className="w-16 h-16 object-contain" />
                  <span className="text-sm text-slate-400">Your company stamp will appear on the agreement.</span>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={handleFreelancerSign} className="bg-blue-600 hover:bg-blue-700">
                  Finalize & Lock
                </Button>
                <Button variant="outline" onClick={() => setShowFreelancerSignPanel(false)} className="border-slate-600 text-slate-300">
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-slate-500 italic">
                This is an informal agreement record for tracking purposes, not a certified legal e-signature.
              </p>
            </div>
          )}
        </div>
      )}



      {(scope.changeOrders && scope.changeOrders.length > 0) && (
        <div className="glass-card p-6 mt-6 border-l-4 border-l-amber-500">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Approved Change Orders
          </h3>
          <div className="space-y-3">
            {scope.changeOrders.map((co) => (
              <div key={co.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-white font-medium">{co.description}</p>
                  <p className="text-xs text-slate-400">Approved {new Date(co.approvedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  + {scope.currency === 'PKR' ? 'Rs. ' : scope.currency === 'USD' ? '$' : scope.currency + ' '}
                  {co.approvedPrice.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <span className="text-sm text-slate-300">New Total</span>
              <span className="text-lg font-bold text-emerald-400">
                {scope.currency === 'PKR' ? 'Rs. ' : scope.currency === 'USD' ? '$' : scope.currency + ' '}
                {((scope.totalBudget || 0) + scope.changeOrders.reduce((s, c) => s + c.approvedPrice, 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Structured Content */}
      <div className="space-y-8">
        {/* In Scope */}
        <div className="glass-card rounded-[2rem] border-green-500/20 shadow-[0_8px_40px_rgba(34,197,94,0.05)] bg-gradient-to-br from-green-500/5 to-transparent overflow-hidden">
          <div className="bg-green-500/10 px-8 py-5 border-b border-green-500/10 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <h2 className="text-xl font-semibold text-green-400 tracking-wide">In Scope</h2>
            {renderBulkApprovalButtons('in-scope') || <span className="ml-auto text-sm text-green-400/60 font-medium">Included deliverables</span>}
          </div>
          <div className="p-8">
            <ul className="space-y-5">
              {inScope.length === 0 ? (
                <li className="text-white/40 text-sm italic py-2 font-light">No items specified</li>
              ) : (
                inScope.map((item, idx) => (
                  <li key={item.id || idx} className={`text-lg leading-relaxed flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-white/90 font-light group animate-in slide-in-from-left-4 fade-in transition-all ${getItemStyle(item)}`} style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                    <div className="flex gap-4">
                      <div className="mt-2 w-2 h-2 rounded-full bg-green-400/50 shrink-0 group-hover:scale-150 group-hover:bg-green-400 transition-all duration-300" />
                      <span>{item.text}</span>
                    </div>
                    {renderApprovalButtons(item)}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Out of Scope */}
          <div className="glass-card rounded-[2rem] border-red-500/20 shadow-[0_8px_40px_rgba(248,113,113,0.05)] bg-gradient-to-br from-red-500/5 to-transparent overflow-hidden">
            <div className="bg-red-500/10 px-6 py-5 border-b border-red-500/10 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
              <h2 className="text-lg font-semibold text-red-400 tracking-wide">Out of Scope</h2>
              {renderBulkApprovalButtons('out-of-scope')}
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {outOfScope.length === 0 ? (
                  <li className="text-white/40 text-sm italic py-2 font-light">No exclusions specified</li>
                ) : (
                  outOfScope.map((item, idx) => (
                    <li key={item.id || idx} className={`text-base leading-relaxed flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-white/80 font-light group animate-in slide-in-from-left-4 fade-in transition-all ${getItemStyle(item)}`} style={{ animationDelay: `${(idx + inScope.length) * 100}ms`, animationFillMode: 'both' }}>
                      <div className="flex gap-3">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400/50 shrink-0 group-hover:scale-150 group-hover:bg-red-400 transition-all duration-300" />
                        <span>{item.text}</span>
                      </div>
                      {renderApprovalButtons(item)}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Assumptions */}
          <div className="glass-card rounded-[2rem] border-orange-500/20 shadow-[0_8px_40px_rgba(249,115,22,0.05)] bg-gradient-to-br from-orange-500/5 to-transparent overflow-hidden">
            <div className="bg-orange-500/10 px-6 py-5 border-b border-orange-500/10 flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              <h2 className="text-lg font-semibold text-orange-400 tracking-wide">Assumptions</h2>
              {renderBulkApprovalButtons('assumption')}
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {assumptions.length === 0 ? (
                  <li className="text-white/40 text-sm italic py-2 font-light">No assumptions specified</li>
                ) : (
                  assumptions.map((item, idx) => (
                    <li key={item.id || idx} className={`text-base leading-relaxed flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-white/80 font-light group animate-in slide-in-from-left-4 fade-in transition-all ${getItemStyle(item)}`} style={{ animationDelay: `${(idx + inScope.length + outOfScope.length) * 100}ms`, animationFillMode: 'both' }}>
                      <div className="flex gap-3">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-400/50 shrink-0 group-hover:scale-150 group-hover:bg-orange-400 transition-all duration-300" />
                        <span>{item.text}</span>
                      </div>
                      {renderApprovalButtons(item)}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
