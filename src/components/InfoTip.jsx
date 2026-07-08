import React from 'react';
import { Info } from 'lucide-react';

export default function InfoTip({ text }) {
  return (
    <span className="relative inline-flex group align-middle ml-1">
      <Info size={14} className="text-slate-400 cursor-help" />
      <span
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-md bg-slate-800 px-3 py-2 text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
