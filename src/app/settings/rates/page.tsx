'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSettingsFromStorage, saveSettings } from '@/lib/storage';
import { AppSettings, CustomRate } from '@/lib/types';
import { getMarketBenchmark } from '@/lib/rate-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Save, TrendingUp, AlertTriangle, CheckCircle, PlusCircle, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export default function RatesSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Custom rate form
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [newRate, setNewRate] = useState<Partial<CustomRate>>({ rateType: 'fixed' });

  useEffect(() => {
    setSettings(getSettingsFromStorage());
    setLoading(false);
  }, []);

  if (loading || !settings) return null;

  const handleSave = () => {
    saveSettings(settings);
    toast.success('Rate configuration saved');
  };

  const handleAddCustomRate = () => {
    if (settings.customRates.length >= 3) {
      toast.error('Free tier is limited to 3 custom task rates. Upgrade to Pro for unlimited rates.', {
        action: { label: 'Upgrade to Pro', onClick: () => alert('Upgrade flow coming soon') }
      });
      return;
    }
    
    if (!newRate.taskType || !newRate.rateValue) {
      toast.error('Task type and amount are required');
      return;
    }

    const rate: CustomRate = {
      id: uuidv4(),
      taskType: newRate.taskType,
      rateType: newRate.rateType as 'fixed' | 'hourly',
      rateValue: Number(newRate.rateValue),
      estimatedHours: newRate.rateType === 'hourly' ? Number(newRate.estimatedHours) : undefined,
      description: newRate.description || ''
    };

    setSettings({ ...settings, customRates: [...settings.customRates, rate] });
    setIsAddingRate(false);
    setNewRate({ rateType: 'fixed' });
  };

  const handleDeleteRate = (id: string) => {
    setSettings({ ...settings, customRates: settings.customRates.filter(r => r.id !== id) });
  };

  const benchmark = getMarketBenchmark(settings.skillCategory, settings.experienceLevel, settings.region, settings.currency);
  
  let rateStatus = 'competitive';
  if (settings.hourlyRate < benchmark.marketLow) rateStatus = 'below';
  else if (settings.hourlyRate > benchmark.marketHigh) rateStatus = 'premium';

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen opacity-50" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/')} className="rounded-full border-white/10 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Rate Configuration</h1>
            <p className="text-white/50 text-sm">Configure your billing rates and market positioning.</p>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
          <Save className="w-4 h-4 mr-2" /> Save Settings
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* API & Identity Card */}
        <div className="glass-card rounded-[2rem] p-8 border-white/10 space-y-6 md:col-span-2">
          <h2 className="text-xl font-semibold border-b border-white/10 pb-4">API & Identity</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="gemini-key" className="text-sm font-medium text-white/80">Gemini API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="gemini-key"
                  type="password"
                  placeholder="AI Studio API Key"
                  className="bg-black/40 border-white/10 font-mono" 
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                />
                <Button variant="outline" className="border-white/10 shrink-0" onClick={() => window.open('https://aistudio.google.com/', '_blank')}>
                  Get Free Key
                </Button>
              </div>
              <p className="text-xs text-white/50">Stored securely in your browser. Required for AI features.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type" className="text-sm font-medium text-white/80">Business Type</Label>
              <select 
                id="business-type"
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={settings.businessType || 'freelancer'}
                onChange={(e) => setSettings({...settings, businessType: e.target.value as 'freelancer' | 'agency'})}
              >
                <option value="freelancer">Freelancer</option>
                <option value="agency">Agency</option>
              </select>
            </div>
            
            {settings.businessType === 'agency' && (
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-sm font-medium text-white/80">Company Name</Label>
                <Input 
                  id="company-name"
                  className="bg-black/40 border-white/10" 
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                />
              </div>
            )}
            
            {settings.businessType === 'agency' && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="company-stamp" className="text-sm font-medium text-white/80">Company Stamp / Logo (Optional)</Label>
                <div className="flex items-center gap-4">
                  {settings.companyStampDataUrl && (
                    <img src={settings.companyStampDataUrl} alt="Company Stamp Preview" className="h-12 w-auto object-contain bg-white/5 rounded p-1" />
                  )}
                  <Input 
                    id="company-stamp"
                    type="file"
                    accept="image/*"
                    className="bg-black/40 border-white/10" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSettings({...settings, companyStampDataUrl: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {settings.companyStampDataUrl && (
                    <Button variant="outline" size="sm" onClick={() => setSettings({...settings, companyStampDataUrl: undefined})}>Clear</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Base Rate Card */}
        <div className="glass-card rounded-[2rem] p-8 border-white/10 space-y-6">
          <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Base Rate & Profile</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-white/80">Your Name</label>
              <Input 
                className="bg-black/40 border-white/10" 
                value={settings.freelancerName}
                onChange={(e) => setSettings({...settings, freelancerName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Your Hourly Rate ($)</label>
              <Input 
                type="number"
                className="bg-black/40 border-white/10 font-mono" 
                value={settings.hourlyRate}
                onChange={(e) => setSettings({...settings, hourlyRate: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Skill Category</label>
              <select 
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={settings.skillCategory}
                onChange={(e) => setSettings({...settings, skillCategory: e.target.value})}
              >
                <option value="web-dev">Web Development</option>
                <option value="mobile-dev">Mobile Development</option>
                <option value="ui-ux-design">UI/UX Design</option>
                <option value="graphic-design">Graphic Design</option>
                <option value="marketing">Marketing</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Experience Level</label>
              <select 
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={settings.experienceLevel}
                onChange={(e) => setSettings({...settings, experienceLevel: e.target.value})}
              >
                <option value="junior">Junior (0-2 yrs)</option>
                <option value="mid">Mid-Level (3-5 yrs)</option>
                <option value="senior">Senior (6-9 yrs)</option>
                <option value="expert">Expert (10+ yrs)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Region</label>
              <select 
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={settings.region}
                onChange={(e) => setSettings({...settings, region: e.target.value})}
              >
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="eu">Europe</option>
                <option value="asia">Asia</option>
                <option value="remote-global">Remote (Global Avg)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Market Benchmark */}
        <div className="glass-card rounded-[2rem] p-8 border-white/10 flex flex-col">
          <h2 className="text-xl font-semibold border-b border-white/10 pb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Market Benchmarks
          </h2>
          
          <div className="flex-1 flex flex-col justify-center space-y-8 mt-4">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <div className="text-white/50 text-sm">Market Low (25th %)</div>
              <div className="font-mono text-white/80">${benchmark.marketLow}/hr</div>
            </div>
            <div className="flex justify-between items-end border-b border-primary/20 pb-2 relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md"></div>
              <div className="text-primary font-medium text-lg">Market Median</div>
              <div className="font-mono text-primary font-bold text-xl">${benchmark.marketMedian}/hr</div>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <div className="text-white/50 text-sm">Market High (75th %)</div>
              <div className="font-mono text-white/80">${benchmark.marketHigh}/hr</div>
            </div>

            <div className={`p-4 rounded-2xl border flex gap-3 ${
              rateStatus === 'below' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
              rateStatus === 'premium' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
            }`}>
              {rateStatus === 'below' && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />}
              {rateStatus === 'competitive' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />}
              {rateStatus === 'premium' && <TrendingUp className="w-5 h-5 shrink-0 text-indigo-400" />}
              <div>
                <strong className="block mb-1">
                  Your Rate: ${settings.hourlyRate}/hr
                </strong>
                <span className="text-sm opacity-80 leading-snug block">
                  {rateStatus === 'below' ? 'Your rate is below the market median. Consider raising it to match your experience.' :
                   rateStatus === 'premium' ? 'Your rate is premium. ScopeSync will use this to justify high-value change requests.' :
                   'Your rate is competitive and well-positioned within market standards.'}
                </span>
              </div>
            </div>
            <p className="text-xs text-white/40 flex items-center gap-1.5 justify-center mt-auto">
              <HelpCircle className="w-3.5 h-3.5" /> Benchmarks based on AI analysis of freelance data.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Task Rates */}
      <div className="glass-card rounded-[2rem] p-8 border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold">Custom Task Rates</h2>
          <div className="text-sm text-white/50 font-medium">
            {settings.customRates.length} / 3 Free Tier Limit
          </div>
        </div>
        
        <p className="text-sm text-white/60 font-light max-w-2xl">
          Override the AI's cost estimates by setting your own fixed prices for specific types of work (e.g. "Payment Integration"). When a client requests a change matching this task, your custom rate will be used.
        </p>

        {settings.customRates.length > 0 && (
          <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-white/40 uppercase bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Task Type</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.customRates.map(rate => (
                  <tr key={rate.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{rate.taskType}</td>
                    <td className="px-6 py-4 text-white/60 capitalize">{rate.rateType}</td>
                    <td className="px-6 py-4 font-mono text-white/80">
                      ${rate.rateValue}{rate.rateType === 'hourly' ? `/hr (est. ${rate.estimatedHours}h)` : ''}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteRate(rate.id)} className="text-white/30 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={isAddingRate} onOpenChange={setIsAddingRate}>
          <DialogTrigger render={<Button variant="outline" className="border-dashed border-white/20 text-white/70 hover:text-white w-full rounded-2xl h-14" onClick={(e) => {
              if (settings.customRates.length >= 3) {
                e.preventDefault();
                handleAddCustomRate(); // Triggers the free tier toast
              }
            }} />}>
              <div className="flex items-center"><PlusCircle className="w-4 h-4 mr-2" /> Add Custom Rate</div>
          </DialogTrigger>
          <DialogContent className="bg-card/40 backdrop-blur-xl border-white/10 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Custom Rate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Task Type (Keyword)</label>
                <Input 
                  placeholder="e.g. 'Authentication' or 'SEO'" 
                  className="bg-black/40 border-white/10"
                  value={newRate.taskType || ''}
                  onChange={e => setNewRate({...newRate, taskType: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Rate Type</label>
                  <select 
                    className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newRate.rateType}
                    onChange={e => setNewRate({...newRate, rateType: e.target.value as 'fixed' | 'hourly'})}
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Amount ($)</label>
                  <Input 
                    type="number" 
                    className="bg-black/40 border-white/10"
                    value={newRate.rateValue || ''}
                    onChange={e => setNewRate({...newRate, rateValue: Number(e.target.value)})}
                  />
                </div>
              </div>
              {newRate.rateType === 'hourly' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Estimated Hours</label>
                  <Input 
                    type="number" 
                    className="bg-black/40 border-white/10"
                    value={newRate.estimatedHours || ''}
                    onChange={e => setNewRate({...newRate, estimatedHours: Number(e.target.value)})}
                  />
                </div>
              )}
              <Button onClick={handleAddCustomRate} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 mt-2">
                Save Custom Rate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
