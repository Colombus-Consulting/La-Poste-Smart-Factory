import React from 'react';
import { STATUS_META } from '../data/mockData';

export function StatusPastille({ status }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function UtilizationBar({ ratio }) {
  const meta = STATUS_META[ratio > 1 ? 'surcharge' : ratio < 0.85 ? 'sous-charge' : 'optimal'];
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, ratio * 100)}%`, backgroundColor: meta.hex }}
      />
    </div>
  );
}
