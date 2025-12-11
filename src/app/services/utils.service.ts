import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

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


    getItalianHolidays(year: number): string[] {
      const holidays: string[] = [];

      const fixed = [
        `${year}-01-01`, `${year}-01-06`,
        `${year}-05-01`, `${year}-06-02`,
        `${year}-08-15`, `${year}-11-01`,
        `${year}-12-08`, `${year}-12-25`,
        `${year}-12-26`
      ];

      holidays.push(...fixed);

      // Pasqua (Meeus)
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31);
      const day = ((h + l - 7 * m + 114) % 31) + 1;

      const easter = new Date(year, month - 1, day);
      const pasqua = easter.toISOString().split('T')[0];
      holidays.push(pasqua);

      const lunedi = new Date(easter);
      lunedi.setDate(easter.getDate() + 1);
      holidays.push(lunedi.toISOString().split('T')[0]);

      return holidays;
    }
}
