'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      {message && (
        <p className="text-text-secondary text-sm">{message}</p>
      )}
    </div>
  );
};
