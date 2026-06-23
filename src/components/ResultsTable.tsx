import React from 'react';
import type { CalculationResult } from '../types.ts';
import { RefreshIcon, DocumentIcon, CalendarIcon } from './IconComponents.tsx';

interface ResultsTableProps {
  data: CalculationResult | null;
  onReset: () => void;
}

const formatDate = (date: Date): string => {
    // Pad with leading zeros if needed
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
};

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{children}</th>
);

const TableCell: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <td className={`px-4 py-4 whitespace-nowrap text-sm text-slate-300 ${className}`}>{children}</td>
);

const SummaryCard: React.FC<{ label: string; date: string; highlight?: boolean }> = ({ label, date, highlight }) => (
    <div className={`p-4 rounded-lg flex-1 transition-all duration-300 h-full ${highlight ? 'bg-cyan-500 border-2 border-cyan-200 shadow-xl shadow-cyan-400/40' : 'bg-slate-800'}`}>
        <p className={`text-sm font-medium ${highlight ? 'text-cyan-900' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-sky-400'}`}>{date}</p>
    </div>
);

export const ResultsTable: React.FC<ResultsTableProps> = ({ data, onReset }) => {
  if (!data) {
    return (
      <div className="text-center py-12 px-6 bg-slate-900/50 rounded-lg border border-slate-700">
        <CalendarIcon className="w-12 h-12 mx-auto text-slate-600" />
        <h3 className="mt-2 text-lg font-medium text-slate-300">Esperando Cálculo</h3>
        <p className="mt-1 text-sm text-slate-500">Ingresa tus datos arriba y haz clic en "Calcular" para ver tus fechas límite.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <DocumentIcon className="w-6 h-6 text-slate-400"/>
          Resultados del Cálculo
        </h2>
        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
        >
          <RefreshIcon className="w-5 h-5"/>
          Nuevo Cálculo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Swapped source order and used `order-first` to force a visual update and trick caching */}
        <div className="order-first">
            <SummaryCard label="Fecha Límite Máx. de Presentación" date={formatDate(data.maxPresentationDate)} highlight />
        </div>
        <div>
            <SummaryCard label="Fecha de Salida de Turista Calculada" date={formatDate(data.exitDate)} />
        </div>
      </div>
       <p className="text-xs text-slate-500 mt-2 mb-8 italic text-center md:text-left">
         *La fecha límite es la que ocurra primero: 30 días desde la llegada o 60 días antes de la salida.
       </p>

      <h3 className="text-lg font-semibold text-white mb-2">Desglose Diario de Presentación</h3>
      <p className="text-xs text-slate-500 mb-4 italic">
        *El "Rango de Fecha de Inicio del Curso" se basa en una estimación de 60 días desde la presentación, un plazo común pero no un requisito legal estricto. Revise siempre los requisitos específicos de su caso.
      </p>

      {/* --- Responsive Table/Card List --- */}

      {/* Desktop Table View: Hidden on small screens, visible from 'sm' breakpoint up */}
      <div className="hidden sm:block -my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-slate-700 sm:rounded-lg">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  <TableHeader>Fecha de Presentación</TableHeader>
                  <TableHeader>Días Restantes (Presentación)</TableHeader>
                  <TableHeader>Rango de Fecha de Inicio del Curso</TableHeader>
                  <TableHeader>Días Restantes (Turista)</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-slate-900/50 divide-y divide-slate-800">
                {data.breakdown.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-800/60 transition-colors duration-150">
                    <TableCell className="font-semibold">{formatDate(row.presentationDate)}</TableCell>
                    <TableCell>
                        <span className="inline-block text-center w-8 h-8 leading-8 rounded-full bg-slate-700 font-bold text-sky-300">
                            {row.remainingPresentationDays}
                        </span>
                    </TableCell>
                    <TableCell>{`${formatDate(row.courseStartDateMin)} - ${formatDate(data.exitDate)}`}</TableCell>
                    <TableCell>{row.remainingTouristDays}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View: Visible only on small screens, hidden from 'sm' up */}
      <div className="block sm:hidden space-y-3">
        {data.breakdown.map((row, index) => (
          <div key={index} className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 shadow-md">
            {/* Top row: Presentation Date */}
            <div className="flex justify-between items-baseline pb-3 mb-3 border-b border-slate-700/50">
              <span className="text-sm font-medium text-slate-400">Fecha Presentación</span>
              <span className="text-base font-semibold text-white">{formatDate(row.presentationDate)}</span>
            </div>

            {/* Middle: Remaining days stats */}
            <div className="flex justify-around items-center mb-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-400">{row.remainingPresentationDays}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Días P/ Presentar</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-300">{row.remainingTouristDays}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Días de Turista</p>
              </div>
            </div>
            
            {/* Bottom: Course Date Range */}
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1 text-center">Rango Válido de Inicio del Curso</div>
              <div className="text-sm text-center font-mono bg-slate-900/80 p-2 rounded-md text-emerald-300 tracking-tight">
                {`${formatDate(row.courseStartDateMin)} → ${formatDate(data.exitDate)}`}
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};