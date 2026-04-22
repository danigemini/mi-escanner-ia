import React from 'react';

export const Spinner: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    {label && <p className="text-slate-600 font-medium animate-pulse">{label}</p>}
  </div>
);
