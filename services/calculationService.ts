import type { BreakdownRow, CalculationResult } from '../types';

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

const diffInDays = (date1: Date, date2: Date): number => {
    const msPerDay = 1000 * 60 * 60 * 24;
    // Calculate the difference in milliseconds and convert to days
    return Math.round((date1.getTime() - date2.getTime()) / msPerDay);
};

export const calculateStudyStayBreakdown = (
    arrivalDateStr: string,
    stayDuration: number,
    presentationDeadline: number
): CalculationResult => {

    if (stayDuration <= 0 || presentationDeadline <= 0) {
        throw new Error('La duración de la estancia y el plazo de presentación deben ser números positivos.');
    }

    if (presentationDeadline > stayDuration) {
        throw new Error('El plazo de presentación no puede ser mayor que la duración total de la estancia de turista.');
    }
    
    const arrivalDate = parseDateUTC(arrivalDateStr);

    const exitDate = addDays(arrivalDate, stayDuration);
    const maxPresentationDate = addDays(arrivalDate, presentationDeadline);

    const breakdown: BreakdownRow[] = [];
    for (let i = 0; i < presentationDeadline; i++) {
        const presentationDate = addDays(arrivalDate, i);
        
        breakdown.push({
            presentationDate,
            remainingPresentationDays: presentationDeadline - i,
            courseStartDateMin: addDays(presentationDate, 60), // As per spreadsheet logic
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