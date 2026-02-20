import { Injectable } from '@angular/core';
import { HolidayService } from './holiday.service';
import { Observable } from 'rxjs';
import { MiniCalendarEvent } from '../interfaces/miniCalendarEvent';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

   constructor(private holidayService: HolidayService) {}

    // Funzione per capitalizzare una stringa
    capitalizeFirstLetter(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    // Altre funzioni generiche
    calculateSum(a: number, b: number): number {
      return a + b;
    }

    getEntries(obj: { [key: string]: string }): [string, string][] {
      return Object.entries(obj);
    }

    generateToken(length: number = 32): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let token = '';
      for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    }

    getDateFormatted(date:Date): string {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

   GetMonth(): any[] {
      let m =  
      [
        { id: 1, name: "Gennaio" },
        { id: 2, name: "Febbraio" },
        { id: 3, name: "Marzo" },
        { id: 4, name: "Aprile" },
        { id: 5, name: "Maggio" },
        { id: 6, name: "Giugno" },
        { id: 7, name: "Luglio" },
        { id: 8, name: "Agosto" },
        { id: 9, name: "Settembre" },
        { id: 10, name: "Ottobre" },
        { id: 11, name: "Novembre" },
        { id: 12, name: "Dicembre" }
      ]

      return m;
  };

  getProvinceItaliane(): string[]{
      return [
      'AG', 'AL', 'AN', 'AO', 'AR', 'AP', 'AT', 'AV', 'BA', 'BT',
      'BL', 'BN', 'BG', 'BI', 'BO', 'BZ', 'BS', 'BR', 'CA', 'CL',
      'CB', 'CI', 'CE', 'CT', 'CZ', 'CH', 'CO', 'CS', 'CR', 'KR',
      'CN', 'EN', 'FM', 'FE', 'FI', 'FG', 'FC', 'FR', 'GE', 'GO',
      'GR', 'IM', 'IS', 'SP', 'LT', 'LE', 'LC', 'LI', 'LO', 'LU',
      'MC', 'MN', 'MS', 'MT', 'ME', 'MI', 'MO', 'MB', 'NA', 'NO',
      'NU', 'OR', 'PD', 'PA', 'PR', 'PV', 'PG', 'PS', 'PE', 'PC',
      'PI', 'PT', 'PN', 'PZ', 'PO', 'RG', 'RA', 'RC', 'RE', 'RI',
      'RN', 'RM', 'RO', 'SA', 'SS', 'SV', 'SI', 'SR', 'SO', 'TA',
      'TE', 'TR', 'TO', 'TP', 'TN', 'TV', 'TS', 'UD', 'VA', 'VE',
      'VB', 'VC', 'VR', 'VV', 'VI', 'VT'
    ]
  }


    getItalianHolidays(year: number): Observable<string[]> {
      return this.holidayService.getAllStringFormat(year);
    }

    getDisabledColor(){
      return "#ffeeeeff";
    }


    toMinutes(time?: string): number {
      if (!time) return 0;
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    }

    calculateOvertime(ev: MiniCalendarEvent, allowedBreakMinutes = 90): number {
      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      if (!ev.endHour || !ev.operatorEndTime || !ev.operatorStartTime) return 0;

      const actualStart = toMinutes(ev.startHour!);
      const actualEnd = toMinutes(ev.endHour);
      const scheduledStart = toMinutes(ev.operatorStartTime);
      const scheduledEnd = toMinutes(ev.operatorEndTime);

      // -------------------------
      // Straordinario iniziale = minuti lavorati oltre previsto
      // -------------------------
      let overtime = 0;

      // ingresso anticipato → aggiunge minuti
      if (actualStart < scheduledStart) {
        overtime += scheduledStart - actualStart;
      }

      // uscita oltre → aggiunge minuti
      if (actualEnd > scheduledEnd) {
        overtime += actualEnd - scheduledEnd;
      }

      // -------------------------
      // Calcola pause totali
      // -------------------------
      let totalBreak = 0;
      if (ev.breaks?.length) {
        for (const b of ev.breaks) {
          if (b.end) {
            totalBreak += toMinutes(b.end) - toMinutes(b.start);
          }
        }
      }

      // se le pause > allowedBreakMinutes → riduce lo straordinario
      const extraBreak = Math.max(0, totalBreak - allowedBreakMinutes);
      overtime -= extraBreak;

      // non può essere negativo
      return Math.max(0, overtime);
    }

    diffMinutes(start?: string, end?: string): number {
        if (!start || !end) return 0;
        return this.toMinutes(end) - this.toMinutes(start);
    }

    formatMinutesToHours(minutes: number): string {
        if (!minutes || minutes <= 0) return '0m';

        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    }

    formatMinutesToHoursRec(minutes: number): string {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    }

    countWorkingDays(
      startDate: string,
      endDate: string,
      month: number,
      year: number,
      holidays: string[]
    ): number {
      let count = 0;

      const holidaySet = new Set(holidays);
      // 🔒 normalizza a mezzanotte locale
      let current = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');

      while (current.getTime() <= end.getTime()) {
        const y = current.getFullYear();
        const m = current.getMonth();
        const d = current.getDate();

        if (y === year && m === month) {
          const day = current.getDay();
          const isWeekend = day === 0 || day === 6;

          const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const isHoliday = holidaySet.has(dateStr);

          if (!isWeekend && !isHoliday) {
            count++;
          }
        }

        // 🔥 avanza SEMPRE di 1 giorno netto
        current.setDate(current.getDate() + 1);
      }

      return count;
    }

  calculateEventDelayOLD(event: MiniCalendarEvent, allowedBreakMinutes = 90): number {
    if (!event.startHour || !event.operatorStartTime) return 0;

    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    let delay = 0;

    // --- Ritardo ingresso ---
    const entryMinutes = toMinutes(event.startHour);
    const startMinutes = toMinutes(event.operatorStartTime);

    // Ritardo ingresso
    if (entryMinutes > startMinutes) {
      delay += entryMinutes - startMinutes;
    } 
    // Recupero se arriva in anticipo
    else if (entryMinutes < startMinutes) {
      delay -= startMinutes - entryMinutes;
    }

    // --- Uscita anticipata / recupero ore ---
    if (event.endHour && event.operatorEndTime) {
      const exitMinutes = toMinutes(event.endHour);
      const endMinutes = toMinutes(event.operatorEndTime);

      if (exitMinutes < endMinutes) {
        // uscita anticipata → aumenta ritardo
        delay += endMinutes - exitMinutes;
      } else if (exitMinutes > endMinutes) {
        // uscita oltre orario → riduce ritardo
        delay -= exitMinutes - endMinutes;
      }
    }

    // --- Gestione pause ---
    let totalBreakMinutes = 0;
    if (event.breaks?.length) {
      event.breaks.forEach(b => {
        const start = toMinutes(b.start);
        const end = toMinutes(b.end!);
        totalBreakMinutes += end - start;
      });
    }

    // Differenza tra pausa effettiva e quella consentita
    const breakDifference = totalBreakMinutes - allowedBreakMinutes;
    delay += breakDifference; // <0 riduce ritardo, >0 aumenta

    return delay; // minuti di ritardo totali (positivo = ritardo, negativo = recupero)
  }

  calculateEventDelay(
    event: MiniCalendarEvent,
    allowedBreakMinutes = 90,
    isDashboard = false
  ): number {

    if (!event.startHour || !event.operatorStartTime) return 0;

    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    let entryDelay = 0;
    let breakDelay = 0;
    let exitExtra = 0;
    let earlyExitDelay = 0;

    // =========================
    // INGRESSO
    // =========================
    const scheduledStart = toMinutes(event.operatorStartTime);
    const actualStart    = toMinutes(event.startHour);

    if (actualStart > scheduledStart) {
      entryDelay = actualStart - scheduledStart;
    }

    // =========================
    // PAUSE
    // =========================
    let totalBreakMinutes = 0;

    if (event.breaks?.length) {
      for (const b of event.breaks) {
        const start = toMinutes(b.start);
        const end   = b.end ? toMinutes(b.end) : start;
        totalBreakMinutes += Math.max(0, end - start);
      }
    }

    if (totalBreakMinutes > allowedBreakMinutes) {
      breakDelay = totalBreakMinutes - allowedBreakMinutes;
    }

    // =========================
    // USCITA
    // =========================
    if (event.endHour && event.operatorEndTime) {
      const scheduledEnd = toMinutes(event.operatorEndTime);
      const actualEnd    = toMinutes(event.endHour);

      if (actualEnd > scheduledEnd) {
        exitExtra = actualEnd - scheduledEnd;
      } else if (actualEnd < scheduledEnd) {
        earlyExitDelay = scheduledEnd - actualEnd;
      }
    }

    // =========================
    // COMPENSAZIONE
    // =========================
    const permissionMinutes = event.permissionMinutes ?? 0;
    const totalDelay = entryDelay + breakDelay;
    const compensatedDelay = Math.max(0, totalDelay - exitExtra);

    const result = compensatedDelay + earlyExitDelay - permissionMinutes;

    return isDashboard ? result : Math.max(0, result);
  }
}

