import type { BreakdownRow, CalculationResult } from '../types.ts';
import { addDays, addMonthsClamped, diffInDays, parseSpanishDateUTC } from '../utils/dateUtils.ts';

const MIN_ANTICIPATION_DAYS = 60;
const PRESENTATION_WINDOW_DAYS = 30;
// Month-based rule for the max presentation date (pending legal confirmation;
// the daily breakdown still uses the day-based constants above).
const PRESENTATION_WINDOW_MONTHS = 1;
const MIN_ANTICIPATION_MONTHS = 2;

interface CalculationParams {
  arrivalDate: string;
  stayDuration?: string;
  exitDate?: string;
}

export const calculateStudyStayBreakdown = (
    params: CalculationParams
): CalculationResult => {
    const { arrivalDate: arrivalDateStr, stayDuration: stayDurationStr, exitDate: exitDateStr } = params;
    
    if (!arrivalDateStr) {
        throw new Error('La fecha de llegada es obligatoria.');
    }

    const arrivalDate = parseSpanishDateUTC(arrivalDateStr);
    let exitDate: Date;

    if (stayDurationStr !== undefined) {
        const stayDuration = parseInt(stayDurationStr, 10);
        if (isNaN(stayDuration) || stayDuration <= 0) {
            throw new Error('La duración de la estancia debe ser un número positivo.');
        }
        exitDate = addDays(arrivalDate, stayDuration - 1);
    } else if (exitDateStr) {
        exitDate = parseSpanishDateUTC(exitDateStr);
        if (exitDate.getTime() < arrivalDate.getTime()) {
            throw new Error('La fecha de salida debe ser posterior a la fecha de llegada.');
        }
    } else {
        throw new Error('Debe proporcionar la duración de la estancia o la fecha de salida.');
    }

    const validBreakdownRows: BreakdownRow[] = [];

    // Iterate through the first 30 days (the maximum possible window)
    for (let i = 0; i < PRESENTATION_WINDOW_DAYS; i++) {
        const presentationDate = addDays(arrivalDate, i);
        
        // For each day, calculate the earliest possible course start date
        const courseStartDateMin = addDays(presentationDate, MIN_ANTICIPATION_DAYS);

        // A presentation date is only valid if the course can start before the tourist stay ends.
        if (courseStartDateMin.getTime() <= exitDate.getTime()) {
            validBreakdownRows.push({
                presentationDate,
                remainingPresentationDays: 0, // Placeholder, calculated later
                courseStartDateMin,
                remainingTouristDays: diffInDays(exitDate, presentationDate) + 1,
            });
        }
    }

    // After checking all potential days, if none were valid, throw an error.
    if (validBreakdownRows.length === 0) {
        throw new Error(
            'Imposible cumplir los plazos. El requisito de que el curso empiece 60 días después de la solicitud hace que la fecha de inicio sea posterior a la de salida del turista.'
        );
    }
    
    // Finalize the breakdown data with the correct remaining days count.
    const finalBreakdown = validBreakdownRows.map((row, index, arr) => ({
        ...row,
        remainingPresentationDays: arr.length - index,
    }));

    // Max presentation date under month-based computation: the earlier of
    // (arrival + 1 month) and (exit − 2 months), each clamped to month end.
    // Note it may differ from the last breakdown row, which still follows the
    // day-based 30/60 rule until the month rule is legally confirmed.
    const presentationLimitByArrival = addMonthsClamped(arrivalDate, PRESENTATION_WINDOW_MONTHS);
    const presentationLimitByExit = addMonthsClamped(exitDate, -MIN_ANTICIPATION_MONTHS);
    const maxPresentationDate =
        presentationLimitByArrival.getTime() <= presentationLimitByExit.getTime()
            ? presentationLimitByArrival
            : presentationLimitByExit;

    return {
        arrivalDate,
        exitDate,
        maxPresentationDate,
        breakdown: finalBreakdown,
    };
};