"use client";

import React from 'react';
import { useApp } from '@/components/providers/app-provider';

export default function DreamBackdrop() {
  const { aura } = useApp();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-colors duration-700"
    >
      {/* Primary Floating Aura Orb */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full blur-[110px] animate-float-slow opacity-80"
        style={{ background: 'var(--aura-1)' }}
      />

      {/* Secondary Floating Aura Orb */}
      <div
        className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[120px] animate-float-slow opacity-75"
        style={{
          background: 'var(--aura-2)',
          animationDelay: '-6s',
          animationDuration: '22s',
        }}
      />

      {/* Tertiary Floating Aura Orb */}
      <div
        className="absolute -bottom-[20%] left-[25%] w-[60vw] h-[50vw] max-w-[700px] max-h-[500px] rounded-full blur-[130px] animate-float-slow opacity-60"
        style={{
          background: 'var(--aura-3)',
          animationDelay: '-11s',
          animationDuration: '26s',
        }}
      />

      {/* Subtle Grid / Starlight Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  );
}
