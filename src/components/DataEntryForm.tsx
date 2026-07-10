import React from 'react';
import { diffInDays, isoToSpanish, tryParseSpanishDateUTC } from '../utils/dateUtils.ts';

export type StayMode = 'duration' | 'departure';

interface DataEntryFormProps {
  mode: StayMode;
  arrivalIso: string;
  durationStr: string;
  exitIso: string;
  onModeChange: (mode: StayMode) => void;
  onArrivalChange: (iso: string) => void;
  onDurationChange: (value: string) => void;
  onExitChange: (iso: string) => void;
}

const INPUT_CLASS =
  'w-full h-12 px-3.5 text-[15px] text-ink bg-surface-sunken border border-border-input rounded-[10px] ' +
  'focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(40,64,110,0.14)]';

const LABEL_CLASS = 'block text-[13.5px] font-semibold text-[#454d5b] mb-2';

const modeButton = (active: boolean) =>
  `px-4 py-2.5 min-h-[44px] text-sm font-semibold border-0 rounded-lg cursor-pointer ` +
  `focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(40,64,110,0.14)] ${
    active
      ? 'bg-primary text-white shadow-[0_1px_2px_rgba(20,28,48,0.25)]'
      : 'bg-transparent text-[#646c7a] hover:bg-white/60'
  }`;

const parseIso = (iso: string) => tryParseSpanishDateUTC(isoToSpanish(iso));

export const DataEntryForm: React.FC<DataEntryFormProps> = ({
  mode,
  arrivalIso,
  durationStr,
  exitIso,
  onModeChange,
  onArrivalChange,
  onDurationChange,
  onExitChange,
}) => {
  // Helper line in departure mode once both dates parse and are ordered
  let calculatedDuration: number | null = null;
  if (mode === 'departure') {
    const arrival = parseIso(arrivalIso);
    const exit = parseIso(exitIso);
    if (arrival != null && exit != null && exit.getTime() >= arrival.getTime()) {
      calculatedDuration = diffInDays(exit, arrival) + 1;
    }
  }

  return (
    <section className="bg-surface border border-border rounded-card shadow-card p-6 sm:p-7 mb-[22px]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-[13px] font-bold tracking-[0.07em] uppercase text-[#7a8290]">
          Detalles del cálculo
        </h2>
        <span className="no-print text-[12.5px] text-faint">Los resultados se actualizan automáticamente</span>
      </div>

      <div className="mb-5">
        <span id="stay-mode-label" className={LABEL_CLASS}>
          Define tu estancia de turista
        </span>
        <div
          role="group"
          aria-labelledby="stay-mode-label"
          className="inline-flex p-1 gap-1 bg-[#f1efe8] border border-border rounded-control flex-wrap"
        >
          <button
            type="button"
            onClick={() => onModeChange('duration')}
            aria-pressed={mode === 'duration'}
            className={modeButton(mode === 'duration')}
          >
            Por duración (días)
          </button>
          <button
            type="button"
            onClick={() => onModeChange('departure')}
            aria-pressed={mode === 'departure'}
            className={modeButton(mode === 'departure')}
          >
            Por fecha de salida
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        <div>
          <label htmlFor="arrivalDate" className={LABEL_CLASS}>
            Fecha de llegada
          </label>
          <input
            type="date"
            id="arrivalDate"
            value={arrivalIso}
            onChange={(e) => onArrivalChange(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {mode === 'duration' ? (
          <div>
            <label htmlFor="stayDuration" className={LABEL_CLASS}>
              Duración de la estancia (días)
            </label>
            <input
              type="number"
              id="stayDuration"
              min="1"
              value={durationStr}
              onChange={(e) => onDurationChange(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="exitDate" className={LABEL_CLASS}>
              Fecha de salida (turista)
            </label>
            <input
              type="date"
              id="exitDate"
              value={exitIso}
              onChange={(e) => onExitChange(e.target.value)}
              className={INPUT_CLASS}
            />
            {calculatedDuration != null && calculatedDuration > 0 && (
              <p className="text-[12.5px] text-[#828a98] mt-[7px]">
                Duración de la estancia calculada: {calculatedDuration} días.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
