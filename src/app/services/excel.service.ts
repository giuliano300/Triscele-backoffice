import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { UtilsService } from './utils.service';

@Injectable({ providedIn: 'root' })
export class ExcelService {
    holidays: string[] = [];

     constructor(private utils: UtilsService) {
     }

    exportMiniCalendar(operators: any[], monthDays: number[], month: number, year: number) {
    const rows: any[] = [];
    this.holidays = this.utils.getItalianHolidays(year);

    const header = ['Operatore', ...monthDays.map(day => `${day}/${month + 1}`)];
    rows.push(header);

    operators.forEach(op => {
        const row: any[] = [];
        row.push(op.fullName);

        monthDays.forEach(day => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 🔥 1) Festivo o weekend → cella vuota
        if (this.isHolidayOrWeekend(dateStr)) {
            row.push('');
            return;
        }

        // 🔎 Tutti gli eventi del giorno
        const events = op.events.filter((e: any) =>
            (e.date === dateStr) ||
            (e.startDate && e.endDate && dateStr >= e.startDate && dateStr <= e.endDate)
        );

        if (!events.length) {
            row.push('');
            return;
        }

        const presenza = events.find((e: any) => e.tipologia === 'presenza');
        const assenza  = events.find((e: any) => e.tipologia === 'assenza');
        const malattia = events.find((e: any) => e.tipologia === 'malattia');

        // 🔴 MALATTIA ha priorità assoluta
        if (malattia) {
            row.push('M');
            return;
        }

        // 🏖️ FERIE (minuscolo!)
        if (assenza && assenza.title === 'ferie') {
            row.push('F');
            return;
        }

        let cell = '';

        // 🟢 PRESENZA
        if (presenza) {
            const pStart = presenza.startHour?.slice(0, 5) ?? '';
            const pEnd   = presenza.endHour?.slice(0, 5) ?? '';
            cell = `${pStart} - ${pEnd}`.trim();
        }

        // 🟡 PERMESSO (assenza NON ferie)
        if (assenza) {
            const aStart = assenza.startHour?.slice(0, 5) ?? '';
            const aEnd   = assenza.endHour?.slice(0, 5) ?? '';
            const permesso = `P ${aStart} - ${aEnd}`.trim();

            cell = cell
            ? `${cell} (${permesso})`
            : permesso;
        }

        row.push(cell);
        });

        rows.push(row);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Calendario');
    XLSX.writeFile(wb, `Calendario_${month + 1}_${year}.xlsx`);
    }

    isHolidayOrWeekend(dateStr: string): boolean {
        const d = new Date(dateStr);
        const day = d.getDay(); // 0 = domenica, 6 = sabato

        const isWeekend = day === 0 || day === 6;

        const isHoliday = this.holidays.includes(dateStr);

        return isWeekend || isHoliday;
    }

}
