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
