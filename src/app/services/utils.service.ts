import { Injectable } from '@angular/core';
import { HolidayService } from './holiday.service';
import { Observable } from 'rxjs';

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


}
