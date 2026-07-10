import { useMemo, useState } from 'react';
import type { CalculationResult } from '../types.ts';
import { DataEntryForm, type StayMode } from './DataEntryForm.tsx';
import { StatusBanner, type BannerVariant } from './StatusBanner.tsx';
import { WaitingCard } from './WaitingCard.tsx';
import { ResultsSummary } from './ResultsSummary.tsx';
import { ResultsTable } from './ResultsTable.tsx';
import { calculateStudyStayBreakdown } from '../services/calculationService.ts';
import { formatDateToSpanish, isoToSpanish } from '../utils/dateUtils.ts';

type CalculationState =
  | { status: 'incomplete' }
  | { status: 'error'; message: string }
  | { status: 'success'; result: CalculationResult };

// The single interactive React island. Raw input state lives here; the result is
// derived live on every change (no submit step). All surrounding static chrome
// (header, advisor CTA, disclaimer) is native Astro.
export function Calculator() {
  const [mode, setMode] = useState<StayMode>('duration');
  const [arrivalIso, setArrivalIso] = useState('');
  const [durationStr, setDurationStr] = useState('90');
  const [exitIso, setExitIso] = useState('');

  const calculation = useMemo<CalculationState>(() => {
    const incomplete =
      !arrivalIso || (mode === 'duration' ? durationStr.trim() === '' : !exitIso);
    if (incomplete) {
      return { status: 'incomplete' };
    }
    try {
      // Native inputs give yyyy-mm-dd; the service contract is dd/mm/aaaa
      const result = calculateStudyStayBreakdown(
        mode === 'duration'
          ? { arrivalDate: isoToSpanish(arrivalIso), stayDuration: durationStr }
          : { arrivalDate: isoToSpanish(arrivalIso), exitDate: isoToSpanish(exitIso) },
      );
      return { status: 'success', result };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      return { status: 'error', message };
    }
  }, [mode, arrivalIso, durationStr, exitIso]);

  let bannerVariant: BannerVariant;
  let bannerTitle: string;
  let bannerText: string;
  if (calculation.status === 'incomplete') {
    bannerVariant = 'incomplete';
    bannerTitle = 'Completa los datos';
    bannerText = 'Introduce una fecha de llegada y una estancia válida para ver tus plazos.';
  } else if (calculation.status === 'error') {
    bannerVariant = 'error';
    bannerTitle = calculation.message.startsWith('Imposible')
      ? 'Estancia demasiado corta'
      : 'Datos no válidos';
    bannerText = calculation.message;
  } else {
    bannerVariant = 'success';
    bannerTitle = 'Tu plan es viable';
    bannerText = `Tienes hasta el ${formatDateToSpanish(calculation.result.maxPresentationDate)} para presentar tu solicitud, con tiempo suficiente para iniciar el curso antes de finalizar tu estancia.`;
  }

  return (
    <>
      <DataEntryForm
        mode={mode}
        arrivalIso={arrivalIso}
        durationStr={durationStr}
        exitIso={exitIso}
        onModeChange={setMode}
        onArrivalChange={setArrivalIso}
        onDurationChange={setDurationStr}
        onExitChange={setExitIso}
      />

      <StatusBanner variant={bannerVariant} title={bannerTitle} text={bannerText} />

      {calculation.status === 'success' ? (
        <div style={{ animation: 'fadeUp .35s ease' }}>
          <ResultsSummary data={calculation.result} />
          <ResultsTable data={calculation.result} />
        </div>
      ) : (
        <WaitingCard />
      )}
    </>
  );
}
