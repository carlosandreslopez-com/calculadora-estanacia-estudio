
import type { CalculatedStayRecord } from '../types';

const parseDate = (dateString: string): Date => {
  const parts = dateString.match(/(\d+)\/(\d+)\/(\d+)\s(\d+):(\d+)/);
  if (!parts) {
    throw new Error(`Invalid date format: "${dateString}". Expected "M/D/YYYY HH:mm".`);
  }

  const [, monthStr, dayStr, yearStr, hourStr, minuteStr] = parts;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed in JS Date
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const date = new Date(year, month, day, hour, minute);
  if (isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    throw new Error(`Could not parse a valid date from: "${dateString}"`);
  }
  return date;
};

export const parseAndCalculate = (file: File): Promise<CalculatedStayRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          throw new Error('File is empty or could not be read.');
        }

        const rows = text.trim().split(/\r?\n/);
        if (rows.length <= 1) {
            throw new Error('CSV file must contain a header and at least one data row.');
        }

        const headerRow = rows.shift()?.trim();
        if (!headerRow) throw new Error('CSV header is missing.');
        
        const headers = headerRow.split(',').map(h => h.trim().toUpperCase());
        
        const requiredHeaders = ['INGRESO', 'SALIDA'];
        for (const required of requiredHeaders) {
            if (!headers.includes(required)) {
                throw new Error(`Invalid CSV header. Missing required column: ${required}`);
            }
        }
        
        const ingresoIndex = headers.indexOf('INGRESO');
        const salidaIndex = headers.indexOf('SALIDA');
        const noIndex = headers.indexOf('NO');
        const idIndex = headers.indexOf('ID');
        const nombreIndex = headers.indexOf('NOMBRE');
        
        const calculatedData: CalculatedStayRecord[] = rows.map((row, index) => {
          if (!row.trim()) return null; // Skip empty rows

          const columns = row.split(',').map(c => c.trim());
          const ingresoStr = columns[ingresoIndex];
          const salidaStr = columns[salidaIndex];

          if (!ingresoStr || !salidaStr) {
            throw new Error(`Missing INGRESO or SALIDA value in row ${index + 2}.`);
          }
          
          const ingresoDate = parseDate(ingresoStr);
          const salidaDate = parseDate(salidaStr);
          
          if (salidaDate.getTime() < ingresoDate.getTime()) {
              throw new Error(`SALIDA date cannot be earlier than INGRESO date in row ${index + 2}.`);
          }

          const diffMs = salidaDate.getTime() - ingresoDate.getTime();
          
          const totalMinutes = diffMs / (1000 * 60);
          const totalHours = diffMs / (1000 * 60 * 60);
          const totalDays = diffMs / (1000 * 60 * 60 * 24);

          const stayDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const remainingMs = diffMs % (1000 * 60 * 60 * 24);
          const stayHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remainingMsAfterHours = remainingMs % (1000 * 60 * 60);
          const stayMinutes = Math.floor(remainingMsAfterHours / (1000 * 60));

          return {
            no: noIndex !== -1 ? columns[noIndex] || '' : String(index + 1),
            id: idIndex !== -1 ? columns[idIndex] || '' : 'N/A',
            nombre: nombreIndex !== -1 ? columns[nombreIndex] || '' : 'N/A',
            ingreso: ingresoStr,
            salida: salidaStr,
            totalDays,
            totalHours,
            totalMinutes,
            stayDays,
            stayHours,
            stayMinutes,
          };
        }).filter(Boolean) as CalculatedStayRecord[];
        
        resolve(calculatedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
        reject(new Error('Failed to read the file.'));
    };

    reader.readAsText(file);
  });
};
