import React from 'react';
import type { CalculationResult } from '../types.ts';
import { RefreshIcon, DocumentIcon, CalendarIcon } from './IconComponents.tsx';

interface ResultsTableProps {
  data: CalculationResult | null;
  onReset: () => void;
}

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC', // Ensure consistent date interpretation
    });
};

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{children}</th>
);

const TableCell: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <td className={`px-4 py-4 whitespace-nowrap text-sm text-slate-300 ${className}`}>{children}</td>
);

const SummaryCard: React.FC<{ label: string, date: string }> = ({ label, date }) => (
    <div className="bg-slate-800 p-4 rounded-lg flex-1">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="text-xl font-bold text-sky-400">{date}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <SummaryCard label="Fecha de Salida de Turista Calculada" date={formatDate(data.exitDate)} />
        <SummaryCard label="Fecha Límite Máx. de Presentación" date={formatDate(data.maxPresentationDate)} />
      </div>

      <h3 className="text-lg font-semibold text-white mb-4">Desglose Diario de Presentación</h3>
      <div className="-my-2 overflow-x-auto">
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
    </div>
  );
};