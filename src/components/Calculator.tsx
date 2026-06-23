import React, { useState } from 'react';
import type { CalculationResult } from '../types.ts';
import { ResultsTable } from './ResultsTable.tsx';
import { DataEntryForm } from './DataEntryForm.tsx';
import { calculateStudyStayBreakdown } from '../services/calculationService.ts';

interface CalculationParams {
  arrivalDate: string;
  stayDuration?: string;
  exitDate?: string;
}

// The single interactive React island: the form and results table share the
// `result`/`error` state, so they must live together in one client component.
// All surrounding static chrome (header, layout, disclaimer) is native Astro.
export function Calculator() {
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
    <>
      <DataEntryForm onCalculate={handleCalculate} error={error} clearError={() => setError(null)} />
      <div className="mt-8">
        <ResultsTable data={result} onReset={handleReset} />
      </div>
    </>
  );
}
