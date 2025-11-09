import type { BreakdownRow, CalculationResult } from '../types.ts';

// Helper to add days to a date, avoiding timezone issues by working in UTC
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

// Helper to parse date string from 'YYYY-MM-DD' format into a UTC Date object
const parseDateUTC = (dateString: string): Date => {
    if (!dateString) {
        throw new Error('La fecha de llegada es obligatoria.');
    }
    const parts = dateString.split('-').map(part => parseInt(part, 10));
    // new Date(year, monthIndex, day)
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    if (isNaN(date.getTime())) {
        throw new Error(`Formato de fecha inválido: "${dateString}".`);
    }
    return date;
};

export const calculateStudyStayBreakdown = (
    arrivalDateStr: string,
    stayDuration: number
): CalculationResult => {
    const daysBeforeExpiryToPresent = 60; // RD 1155/2024, Art. 54.3: "antelación mínima de dos meses"
    const daysAfterPresentationForCourseStart = 60; // RD 1155/2024, Art. 54: "antelación mínima de dos meses"

    if (stayDuration <= 0) {
        throw new Error('La duración de la estancia debe ser un número positivo.');
    }

    if (stayDuration <= daysBeforeExpiryToPresent) {
        throw new Error(`La estancia de turista (${stayDuration} días) es demasiado corta. Debe ser mayor de ${daysBeforeExpiryToPresent} días para poder presentar la solicitud.`);
    }
    
    const arrivalDate = parseDateUTC(arrivalDateStr);

    const presentationWindowDays = stayDuration - daysBeforeExpiryToPresent;
    
    const exitDate = addDays(arrivalDate, stayDuration);
    const maxPresentationDate = addDays(arrivalDate, presentationWindowDays - 1);

    const breakdown: BreakdownRow[] = [];
    for (let i = 0; i < presentationWindowDays; i++) {
        const presentationDate = addDays(arrivalDate, i);
        
        breakdown.push({
            presentationDate,
            remainingPresentationDays: presentationWindowDays - i,
            courseStartDateMin: addDays(presentationDate, daysAfterPresentationForCourseStart),
            remainingTouristDays: stayDuration - i,
        });
    }

    return {
        arrivalDate,
        exitDate,
        maxPresentationDate,
        breakdown,
    };
};
