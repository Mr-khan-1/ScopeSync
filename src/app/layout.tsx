import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Sparkles, Settings } from 'lucide-react';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ScopeSync | Proactive Scope Transparency',
  description: 'Eliminate freelance scope creep before it starts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col overflow-x-hidden`}>
        {/* Floating Navigation */}
        <div className="fixed top-4 left-0 right-0 z-50 px-2 sm:px-4 pointer-events-none animate-in fade-in slide-in-from-top-8 duration-700">
          <header className="pointer-events-auto mx-auto max-w-5xl glass rounded-full px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
              <div className="bg-primary p-1.5 rounded-full shadow-[0_0_15px_rgba(200,100,255,0.8)]">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline">Scope</span><span className="hidden sm:inline text-primary font-light">Sync</span>
            </Link>
            
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link href="/">
                <div className="px-3 sm:px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2 rounded-full hover:bg-white/5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </div>
              </Link>
              <Link href="/settings/rates">
                <div className="px-3 sm:px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2 rounded-full hover:bg-white/5">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </div>
              </Link>
              <Link href="/scope/new">
                <div className="px-4 sm:px-5 py-2 text-sm font-medium text-white bg-primary/90 hover:bg-primary transition-all shadow-[0_0_20px_rgba(200,100,255,0.4)] hover:shadow-[0_0_30px_rgba(200,100,255,0.6)] hover:-translate-y-0.5 flex items-center gap-2 rounded-full whitespace-nowrap">
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">New Scope</span>
                  <span className="sm:hidden">New</span>
                </div>
              </Link>
            </nav>
          </header>
        </div>

        <main className="flex-1 container mx-auto max-w-6xl px-4 md:px-6 pt-32 pb-12 relative z-10">
          {children}
        </main>
        
        <Toaster theme="dark" position="bottom-right" toastOptions={{
          className: 'glass !border-white/10 !bg-background/80 backdrop-blur-xl',
        }} />
      </body>
    </html>
  );
}
