import React, { useState } from 'react';
import type { CalculationResult } from './types.ts';
import { ResultsTable } from './components/ResultsTable.tsx';
import { Header } from './components/Header.tsx';
import { DataEntryForm } from './components/DataEntryForm.tsx';
import { DisclaimerFooter } from './components/DisclaimerFooter.tsx';
import { calculateStudyStayBreakdown } from './services/calculationService.ts';

interface CalculationParams {
  arrivalDate: string;
  stayDuration?: string;
  exitDate?: string;
}

function App() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (params: CalculationParams): boolean => {
    try {
      setError(null);
      const newResult = calculateStudyStayBreakdown(params);
      setResult(newResult);
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      setError(errorMessage);
      setResult(null);
      return false;
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 bg-slate-800/50 rounded-xl p-4 sm:p-8 border border-slate-700 shadow-2xl shadow-slate-950/50">
          <DataEntryForm onCalculate={handleCalculate} error={error} clearError={() => setError(null)} />
          <div className="mt-8">
            <ResultsTable data={result} onReset={handleReset} />
          </div>
        </main>
        <DisclaimerFooter />
      </div>
    </div>
  );
}

export default App;