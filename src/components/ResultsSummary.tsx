import React, { useState, useRef } from 'react';
import type { CalculationResult } from '../types.ts';
import {
  addMonthsClamped,
  diffInDays,
  formatDateLongSpanish,
  formatDateToSpanish as formatDate,
} from '../utils/dateUtils.ts';
import { DownloadIcon, ShareIcon, SparkleIcon } from './IconComponents.tsx';

interface ResultsSummaryProps {
  data: CalculationResult;
}

const MILESTONE_DOT_STYLES = [
  'bg-[#f1efe8] text-[#646c7a] border border-border-input',
  'bg-primary text-white border border-primary',
  'bg-success-bg text-success border border-success-border',
  'bg-[#f1efe8] text-[#646c7a] border border-border-input',
];

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ data }) => {
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { arrivalDate, exitDate, maxPresentationDate, breakdown } = data;

  const daysAvailable = Math.max(0, diffInDays(maxPresentationDate, arrivalDate) + 1);
  const daysAvailableStr =
    daysAvailable === 1
      ? '1 día disponible para presentar'
      : `${daysAvailable} días disponibles para presentar`;
  const totalDays = diffInDays(exitDate, arrivalDate) + 1;

  // Which rule set the deadline: compare against arrival + 1 month (derive, don't recompute)
  const governedByArrival =
    maxPresentationDate.getTime() === addMonthsClamped(arrivalDate, 1).getTime();
  const governedNote = governedByArrival
    ? 'Determinada por el plazo de 1 mes desde tu llegada.'
    : 'Determinada por el margen de 2 meses antes de tu salida.';

  // Course window if presenting at the deadline — from the breakdown row matching the
  // deadline, falling back to the last day-based row while the month rule is pending.
  const deadlineRow =
    breakdown.find((row) => row.presentationDate.getTime() === maxPresentationDate.getTime())
    ?? breakdown[breakdown.length - 1];
  const courseWindow = `${formatDate(deadlineRow.courseStartDateMin)} – ${formatDate(exitDate)}`;

  const milestones = [
    {
      date: formatDate(arrivalDate),
      label: 'Llegada al país',
      desc: 'Inicia tu estancia como turista. El plazo para presentar empieza hoy.',
    },
    {
      date: formatDate(maxPresentationDate),
      label: 'Fecha límite para presentar',
      desc: `${governedNote} Es tu fecha más importante.`,
    },
    {
      date: courseWindow,
      label: 'Ventana de inicio del curso',
      desc: 'El curso puede comenzar a partir de los 60 días desde tu solicitud.',
    },
    {
      date: formatDate(exitDate),
      label: 'Fin de estancia como turista',
      desc: `Último día de tu estancia legal de ${totalDays} días como turista.`,
    },
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  const handlePdf = () => {
    window.print();
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — still confirm intent
    }
    showToast('Enlace copiado al portapapeles');
  };

  return (
    <>
      {/* Results grid: hero + stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-[1.25fr_1fr] gap-[18px] mb-[22px]">
        <div
          className="rounded-card p-6 pb-[24px] text-white shadow-hero relative overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #2b4068, #1f2e4d)' }}
        >
          <div className="text-xs font-bold tracking-[0.08em] uppercase text-on-primary-label mb-4">
            Fecha límite para presentar
          </div>
          <div className="font-display font-medium text-[31px] sm:text-[38px] leading-[1.02] tracking-[-0.01em] mb-1.5">
            {formatDateLongSpanish(maxPresentationDate)}
          </div>
          <div className="text-sm text-on-primary-sub mb-[18px]">{formatDate(maxPresentationDate)}</div>
          <div className="inline-flex items-center gap-2 px-[13px] py-[7px] bg-white/12 border border-white/18 rounded-[9px] text-[13.5px] text-white">
            {daysAvailableStr}
          </div>
          <div className="text-[12.5px] leading-[1.5] text-[#8fa0c6] mt-4">{governedNote}</div>
        </div>
        <div className="grid grid-rows-2 gap-[18px]">
          <div className="bg-surface border border-border rounded-card px-[22px] py-5 flex flex-col justify-center">
            <div className="text-xs font-bold tracking-[0.07em] uppercase text-[#8a92a0] mb-[9px]">
              Salida como turista
            </div>
            <div className="font-display font-medium text-[26px] leading-none text-[#1b2433]">
              {formatDate(exitDate)}
            </div>
            <div className="text-[13px] text-[#828a98] mt-1.5">Estancia total de {totalDays} días</div>
          </div>
          <div className="bg-surface border border-border rounded-card px-[22px] py-5 flex flex-col justify-center">
            <div className="text-xs font-bold tracking-[0.07em] uppercase text-[#8a92a0] mb-[9px]">
              Ventana de inicio del curso
            </div>
            <div className="font-display font-medium text-[18px] leading-[1.25] text-[#1b2433]">
              {courseWindow}
            </div>
            <div className="text-[13px] text-[#828a98] mt-1.5">Si presentas en la fecha límite</div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-surface border border-border rounded-card px-7 pt-7 pb-3 mb-[22px]">
        <h2 className="text-[13px] font-bold tracking-[0.07em] uppercase text-[#7a8290] mb-6">
          Tu línea de tiempo
        </h2>
        {milestones.map((m, i) => (
          <div key={i} className="grid grid-cols-[30px_1fr] gap-[18px]">
            <div className="flex flex-col items-center">
              <span
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-bold ${MILESTONE_DOT_STYLES[i]}`}
              >
                {i + 1}
              </span>
              <span
                className={`flex-1 w-0.5 my-1 ${i === milestones.length - 1 ? 'bg-transparent' : 'bg-[#eae6da]'}`}
              ></span>
            </div>
            <div className="pb-[26px]">
              <div className="flex items-baseline gap-3 flex-wrap mb-[5px] leading-[1.3]">
                <span
                  className={`font-display font-medium text-xl ${i === 1 ? 'text-primary' : 'text-[#1b2433]'}`}
                >
                  {m.date}
                </span>
                <span className="text-[14.5px] font-semibold text-ink-2">{m.label}</span>
              </div>
              <div className="text-[13.5px] leading-[1.55] text-muted-2">{m.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Lead CTA: PDF + share now; the email form ships in a later phase */}
      <section className="no-print bg-[#eef1f7] border border-[#d7deec] rounded-card p-[26px] mb-[22px]">
        <div className="flex items-start gap-[13px] mb-[18px]">
          <span className="flex-shrink-0 w-[38px] h-[38px] rounded-control bg-primary text-white flex items-center justify-center">
            <SparkleIcon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-ink-block mb-1">Guarda tus fechas y recibe recordatorios</h3>
            <p className="text-sm leading-[1.5] text-[#5f6776]">
              Te enviamos tu calendario de plazos y un aviso antes de cada fecha clave.
            </p>
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handlePdf}
            className="inline-flex items-center gap-2 h-11 px-4 text-sm font-semibold text-primary-text bg-white border border-[#d7deec] rounded-[10px] cursor-pointer hover:bg-surface-sunken focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(40,64,110,0.14)]"
          >
            <DownloadIcon className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 h-11 px-4 text-sm font-semibold text-primary-text bg-white border border-[#d7deec] rounded-[10px] cursor-pointer hover:bg-surface-sunken focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(40,64,110,0.14)]"
          >
            <ShareIcon className="w-4 h-4" />
            Compartir enlace
          </button>
        </div>
      </section>

      {toast && (
        <div
          role="status"
          className="no-print fixed left-1/2 bottom-7 -translate-x-1/2 px-5 py-[13px] bg-ink-block text-white text-sm font-medium rounded-control shadow-[0_12px_30px_-10px_rgba(0,0,0,0.4)] z-50"
          style={{ animation: 'toastIn .25s ease' }}
        >
          {toast}
        </div>
      )}
    </>
  );
};
