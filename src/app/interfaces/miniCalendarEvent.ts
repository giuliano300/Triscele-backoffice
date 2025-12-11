export interface MiniCalendarEvent {
  tipologia: 'presenza' | 'assenza' | 'malattia';
  id: string;
  title: string;
  fullName: string;
  date?: string; // YYYY-MM-DD, per presenze giornaliere
  startDate?: string; // YYYY-MM-DD, per assenze e malattie
  endDate?: string;   // YYYY-MM-DD, per assenze e malattie
  startHour?: string; // HH:mm:ss
  endHour?: string;   // HH:mm:ss
  notes?: string;
}