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
        row.push(op.name + ' ' + op.lastName);

        monthDays.forEach(day => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 🔥 1) Se festivo → cella vuota SEMPRE
        if (this.isHolidayOrWeekend(dateStr)) {
            row.push('');
            return;
        }

        const ev = op.events.find((e: any) =>
            (e.date === dateStr) ||
            (e.startDate && e.endDate && dateStr >= e.startDate && dateStr <= e.endDate)
        );

        if (!ev) {
            row.push('');
            return;
        }

        // 🔹 PRESENZA (senza secondi)
        if (ev.tipologia === 'presenza') {
            const start = ev.startHour ? ev.startHour.slice(0, 5) : '';
            const end = ev.endHour ? ev.endHour.slice(0, 5) : '';
            row.push(`${start} - ${end}`.trim());
            return;
        }

        // 🔹 MALATTIA
        if (ev.tipologia === 'malattia') {
            row.push('M');
            return;
        }

        // 🔹 ASSENZA (ferie o permesso)
        if (ev.tipologia === 'assenza') {
            if (ev.title === 'Ferie') row.push('F');
            else row.push('P');
            return;
        }

        row.push('');
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
