import { describe, it, expect } from 'vitest';
import { calculateStudyStayBreakdown } from './calculationService.ts';

// Build the expected UTC date for assertions (month is 1-based here for readability)
const utc = (day: number, month: number, year: number): Date =>
    new Date(Date.UTC(year, month - 1, day));

describe('calculateStudyStayBreakdown — input validation', () => {
    it('throws if the arrival date is missing', () => {
        expect(() => calculateStudyStayBreakdown({ arrivalDate: '' }))
            .toThrow('La fecha de llegada es obligatoria.');
    });

    it('throws on a bad date format', () => {
        expect(() => calculateStudyStayBreakdown({ arrivalDate: '2026-01-15', stayDuration: '90' }))
            .toThrow('Formato de fecha inválido');
    });

    it('throws on a nonexistent calendar date (31/02)', () => {
        expect(() => calculateStudyStayBreakdown({ arrivalDate: '31/02/2026', stayDuration: '90' }))
            .toThrow('Fecha inválida');
    });

    it('throws if the exit date is before the arrival date', () => {
        expect(() => calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', exitDate: '14/01/2026' }))
            .toThrow('La fecha de salida debe ser posterior a la fecha de llegada.');
    });

    it('throws on a non-positive duration', () => {
        expect(() => calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '0' }))
            .toThrow('La duración de la estancia debe ser un número positivo.');
        expect(() => calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '-5' }))
            .toThrow('La duración de la estancia debe ser un número positivo.');
    });

    it('throws when neither duration nor exit date is given', () => {
        expect(() => calculateStudyStayBreakdown({ arrivalDate: '15/01/2026' }))
            .toThrow('Debe proporcionar la duración de la estancia o la fecha de salida.');
    });
});

describe('calculateStudyStayBreakdown — daily breakdown (day-based, unchanged)', () => {
    it('produces 30 rows for a 90-day stay, stepping exactly 1 UTC day per row', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '90' });
        expect(result.breakdown).toHaveLength(30);
        expect(result.arrivalDate).toEqual(utc(15, 1, 2026));
        expect(result.exitDate).toEqual(utc(14, 4, 2026));
        expect(result.breakdown[0].presentationDate).toEqual(utc(15, 1, 2026));
        for (let i = 1; i < result.breakdown.length; i++) {
            const step = result.breakdown[i].presentationDate.getTime()
                - result.breakdown[i - 1].presentationDate.getTime();
            expect(step).toBe(24 * 60 * 60 * 1000);
        }
    });

    it('counts remainingPresentationDays down to 1 and starts remainingTouristDays at the stay length', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '90' });
        expect(result.breakdown[0].remainingPresentationDays).toBe(30);
        expect(result.breakdown[29].remainingPresentationDays).toBe(1);
        expect(result.breakdown[0].remainingTouristDays).toBe(90);
    });

    it('estimates each course start at presentation + 60 days', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '90' });
        expect(result.breakdown[0].courseStartDateMin).toEqual(utc(16, 3, 2026));
    });

    it('duration mode and exit-date mode give identical results for equivalent inputs', () => {
        const byDuration = calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '90' });
        const byExit = calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', exitDate: '14/04/2026' });
        expect(byExit).toEqual(byDuration);
    });

    it('a 61-day stay leaves exactly 1 valid row; 60 days is impossible', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '61' });
        expect(result.breakdown).toHaveLength(1);
        expect(() => calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '60' }))
            .toThrow('Imposible cumplir los plazos');
    });

    it('steps 1 UTC day per row across the late-March DST change (timezone insensitivity)', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '15/03/2026', stayDuration: '90' });
        for (let i = 1; i < result.breakdown.length; i++) {
            const step = result.breakdown[i].presentationDate.getTime()
                - result.breakdown[i - 1].presentationDate.getTime();
            expect(step).toBe(24 * 60 * 60 * 1000);
        }
    });
});

describe('maxPresentationDate — month-based rule (de fecha a fecha, pending legal confirmation)', () => {
    // FLMP = earlier of (arrival + 1 month) and (exit − 2 months);
    // when the target day does not exist, clamp to the last day of that month.

    it('owner example 1: arrival 15/01/2026, 90 days → exit 14/04/2026, FLMP = 14/02/2026', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '90' });
        expect(result.exitDate).toEqual(utc(14, 4, 2026));
        expect(result.maxPresentationDate).toEqual(utc(14, 2, 2026));
    });

    it('owner example 2: arrival 31/01/2026, exit 30/04/2026 → «30/02» clamps to FLMP = 28/02/2026', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '31/01/2026', exitDate: '30/04/2026' });
        expect(result.maxPresentationDate).toEqual(utc(28, 2, 2026));
    });

    it('arrival cap governs on long stays: arrival 15/01/2026 + 180 days → FLMP = 15/02/2026', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '15/01/2026', stayDuration: '180' });
        expect(result.exitDate).toEqual(utc(13, 7, 2026));
        expect(result.maxPresentationDate).toEqual(utc(15, 2, 2026));
    });

    it('arrival + 1 month clamps to month end: arrival 31/08/2026 + 180 days → FLMP = 30/09/2026', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '31/08/2026', stayDuration: '180' });
        expect(result.maxPresentationDate).toEqual(utc(30, 9, 2026));
    });

    it('leap year: arrival 30/01/2028, exit 29/04/2028 → both rules meet at 29/02/2028', () => {
        const result = calculateStudyStayBreakdown({ arrivalDate: '30/01/2028', exitDate: '29/04/2028' });
        expect(result.maxPresentationDate).toEqual(utc(29, 2, 2028));
    });
});
