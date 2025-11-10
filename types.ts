// FIX: Add missing CalculatedStayRecord interface, which is used in services/csvProcessor.ts.
export interface CalculatedStayRecord {
  no: string;
  id: string;
  nombre: string;
  ingreso: string;
  salida: string;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  stayDays: number;
  stayHours: number;
  stayMinutes: number;
}

export interface BreakdownRow {
  presentationDate: Date;
  remainingPresentationDays: number;
  courseStartDateMin: Date;
  remainingTouristDays: number;
}

export interface CalculationResult {
  arrivalDate: Date;
  exitDate: Date;
  maxPresentationDate: Date;
  breakdown: BreakdownRow[];
}
