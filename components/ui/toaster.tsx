"use client"

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          color: '#333',
          borderRadius: '12px',
        },
        className: 'sonner-toast',
        descriptionClassName: 'sonner-toast-description',
        duration: 4000,
      }}
    />
  );
} 