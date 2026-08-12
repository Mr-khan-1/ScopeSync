'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center animate-in fade-in px-4">
      <div className="bg-destructive/10 p-6 rounded-full border border-destructive/20">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Something went wrong</h2>
        <p className="text-white/60 max-w-md mx-auto">
          {error.message || "An unexpected error occurred. Please try again or refresh the page."}
        </p>
      </div>
      <Button 
        onClick={() => reset()}
        className="bg-primary hover:bg-primary/90 text-white rounded-full h-12 px-8 mt-4 shadow-[0_0_20px_rgba(200,100,255,0.4)]"
      >
        Try again
      </Button>
    </div>
  );
}
