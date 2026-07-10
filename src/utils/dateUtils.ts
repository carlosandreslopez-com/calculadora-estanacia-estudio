// Shared UTC date helpers. All date math in this app works in UTC to avoid
// timezone drift (see CLAUDE.md "Date handling").

// Add days to a date, avoiding timezone issues by working in UTC
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

// Month-based deadline arithmetic ("de fecha a fecha", Ley 39/2015): the deadline
// falls on the same day number in the target month; if that day does not exist
// (e.g. 30/02), it clamps to the last day of that month. Works in UTC.
export const addMonthsClamped = (date: Date, months: number): Date => {
    const year = date.getUTCFullYear();
    const targetMonth = date.getUTCMonth() + months;
    const lastDayOfTargetMonth = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, targetMonth, Math.min(date.getUTCDate(), lastDayOfTargetMonth)));
};

// Parse a 'dd/mm/yyyy' string into a UTC Date; throws Spanish-language errors
// (the calculationService contract).
export const parseSpanishDateUTC = (dateString: string): Date => {
    if (!dateString) {
        throw new Error('La fecha es obligatoria.');
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        throw new Error(`Formato de fecha inválido: "${dateString}". Use dd/mm/aaaa.`);
    }

    const parts = dateString.split('/').map(part => parseInt(part, 10));
    const [day, month, year] = parts;

    const date = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        throw new Error(`Fecha inválida: "${dateString}". Verifique el día y el mes.`);
    }
    return date;
};

// Non-throwing variant for live form input: null while the string isn't a
// complete, real dd/mm/yyyy date yet.
export const tryParseSpanishDateUTC = (dateString: string): Date | null => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return null;
    }
    const parts = dateString.split('/').map(part => parseInt(part, 10));
    const [day, month, year] = parts;

    const date = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return null;
    }
    return date;
};

// Format a Date to 'dd/mm/yyyy'
export const formatDateToSpanish = (date: Date): string => {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
};

// Format a Date to the long Spanish form used by the hero card, e.g. "12 de agosto, 2026"
const SPANISH_MONTHS = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const formatDateLongSpanish = (date: Date): string =>
    `${date.getUTCDate()} de ${SPANISH_MONTHS[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;

// Whole-day difference between two UTC dates (date1 − date2)
export const diffInDays = (date1: Date, date2: Date): number => {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((date1.getTime() - date2.getTime()) / msPerDay);
};

// Native <input type="date"> boundary (D4): 'yyyy-mm-dd' ↔ 'dd/mm/aaaa'.
// Pure string reshuffles — no Date object, so nothing can drift.
export const isoToSpanish = (iso: string): string => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return '';
    return `${match[3]}/${match[2]}/${match[1]}`;
};

export const spanishToIso = (spanish: string): string => {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(spanish);
    if (!match) return '';
    return `${match[3]}-${match[2]}-${match[1]}`;
};
