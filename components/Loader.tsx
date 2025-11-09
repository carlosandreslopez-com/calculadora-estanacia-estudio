
import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-sky-500 border-t-transparent"></div>
    <p className="mt-4 text-lg font-semibold text-slate-300">Processing file...</p>
    <p className="text-sm text-slate-400">Please wait while we calculate the durations.</p>
  </div>
);
