import React from 'react';
import { CloudUpload, Loader2 } from 'lucide-react';

export default function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gd-blue">
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-gd-blue">
          <CloudUpload className="h-8 w-8 text-white" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-black text-white">CloudNest</h1>
          <p className="mt-2 text-sm text-white/70">Loading your workspace...</p>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-white/80" />
      </div>
    </div>
  );
}
