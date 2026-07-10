import React, { useState } from 'react';
import type { CalculationResult } from '../types.ts';
import { formatDateToSpanish as formatDate } from '../utils/dateUtils.ts';
import { ChevronDownIcon } from './IconComponents.tsx';

interface ResultsTableProps {
  data: CalculationResult;
}

const TH_CLASS =
  'text-left text-[11px] font-bold tracking-[0.05em] uppercase text-faint pt-4 pb-2.5';

const daysPill = (rest: number) =>
  `inline-flex items-center justify-center min-w-[30px] h-6 px-[9px] rounded-[7px] text-[13px] font-bold ${
    rest <= 7
      ? 'bg-error-bg text-error'
      : 'bg-white text-primary-text border border-[#d7deec]'
  }`;

// Row treatment for the month-rule demo: highlight the row equal to the
// month-based deadline, dim the day-based rows past it (pending legal confirmation).
const rowDemoState = (rowTime: number, flmpTime: number) =>
  rowTime === flmpTime ? 'flmp' : rowTime > flmpTime ? 'past' : 'normal';

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [open, setOpen] = useState(false);

  const flmpTime = data.maxPresentationDate.getTime();
  const rowCount = data.breakdown.length;

  return (
    <section className="bg-surface border border-border rounded-card overflow-hidden mb-[22px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="no-print w-full flex items-center justify-between gap-4 px-6 py-5 bg-transparent border-0 cursor-pointer text-left hover:bg-surface-sunken focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_3px_rgba(40,64,110,0.14)]"
      >
        <div>
          <div className="text-[15px] font-bold text-ink-2">Desglose diario de presentación</div>
          <div className="text-[13px] text-[#8a92a0] mt-0.5">{rowCount} fechas posibles · día a día</div>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-muted-2 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-[#eceae2]">
          <p className="px-6 pt-3 text-[12.5px] leading-[1.5] text-faint">
            *El "Rango de Fecha de Inicio del Curso" se basa en una estimación de 60 días desde la presentación, un plazo común pero no un requisito legal estricto. Revise siempre los requisitos específicos de su caso.
          </p>
          <p className="px-6 pt-1.5 pb-1 text-[12.5px] leading-[1.5] italic text-warn-accent">
            *El desglose sigue aún la regla anterior de 30/60 días. La fila resaltada es la fecha
            límite según el cómputo por meses; las filas atenuadas quedarían fuera de plazo bajo esa
            regla. Si no hay fila resaltada, la fecha límite por meses es posterior a la última fila
            y todo el desglose es válido.
          </p>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className={`${TH_CLASS} px-6`}>Fecha de presentación</th>
                  <th className={`${TH_CLASS} px-3`}>Días rest.</th>
                  <th className={`${TH_CLASS} px-3`}>Ventana inicio del curso</th>
                  <th className={`${TH_CLASS} px-6`}>Días turista</th>
                </tr>
              </thead>
              <tbody>
                {data.breakdown.map((row, index) => {
                  const demo = rowDemoState(row.presentationDate.getTime(), flmpTime);
                  const zebra = index % 2 ? 'bg-surface-sunken' : 'bg-white';
                  const demoClass =
                    demo === 'flmp'
                      ? 'bg-warn-bg shadow-[inset_0_0_0_2px_var(--color-warn-accent)]'
                      : demo === 'past'
                        ? `${zebra} opacity-40`
                        : zebra;
                  return (
                    <tr key={index} className={`border-t border-[#f0eee6] ${demoClass}`}>
                      <td className="px-6 py-[13px] text-sm font-semibold text-ink-2 whitespace-nowrap">
                        {formatDate(row.presentationDate)}
                        {demo === 'flmp' && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-warn-accent text-white rounded px-1.5 py-0.5 align-middle">
                            Límite (meses)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-[13px]">
                        <span className={daysPill(row.remainingPresentationDays)}>
                          {row.remainingPresentationDays}
                        </span>
                      </td>
                      <td className="px-3 py-[13px] text-[13.5px] text-[#5f6776] whitespace-nowrap">
                        {`${formatDate(row.courseStartDateMin)} – ${formatDate(data.exitDate)}`}
                      </td>
                      <td className="px-6 py-[13px] text-sm text-[#5f6776]">{row.remainingTouristDays}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="sm:hidden p-4 flex flex-col gap-3">
            {data.breakdown.map((row, index) => {
              const demo = rowDemoState(row.presentationDate.getTime(), flmpTime);
              const demoClass =
                demo === 'flmp'
                  ? 'border-warn-accent ring-1 ring-warn-accent bg-warn-bg'
                  : demo === 'past'
                    ? 'border-[#ece9e0] bg-surface-sunken opacity-40'
                    : 'border-[#ece9e0] bg-surface-sunken';
              return (
                <div key={index} className={`border rounded-[13px] p-4 ${demoClass}`}>
                  <div className="flex items-center justify-between gap-2.5 mb-3.5">
                    <span className="text-[15px] font-bold text-ink-2">
                      {formatDate(row.presentationDate)}
                      {demo === 'flmp' && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-warn-accent text-white rounded px-1.5 py-0.5 align-middle">
                          Límite (meses)
                        </span>
                      )}
                    </span>
                    <span className={daysPill(row.remainingPresentationDays)}>
                      {row.remainingPresentationDays} d
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <div className="bg-white border border-[#ece9e0] rounded-[10px] px-[13px] py-[11px]">
                      <div className="text-[22px] font-bold text-primary leading-none">
                        {row.remainingPresentationDays}
                      </div>
                      <div className="text-[11.5px] text-[#8a92a0] mt-[5px] leading-[1.3]">Días p/ presentar</div>
                    </div>
                    <div className="bg-white border border-[#ece9e0] rounded-[10px] px-[13px] py-[11px]">
                      <div className="text-[22px] font-bold text-ink-2 leading-none">{row.remainingTouristDays}</div>
                      <div className="text-[11.5px] text-[#8a92a0] mt-[5px] leading-[1.3]">Días de turista</div>
                    </div>
                  </div>
                  <div className="bg-success-bg border border-success-border rounded-[10px] px-[13px] py-2.5">
                    <div className="text-[10.5px] font-bold tracking-[0.05em] uppercase text-[#5b9374] mb-[3px]">
                      Ventana inicio del curso
                    </div>
                    <div className="text-[13.5px] font-semibold text-success-ink">
                      {`${formatDate(row.courseStartDateMin)} – ${formatDate(data.exitDate)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
