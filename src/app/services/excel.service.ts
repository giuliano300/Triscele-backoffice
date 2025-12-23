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

    // =========================
    // FOGLIO 1 – CALENDARIO
    // =========================
    const header = ['Operatore', ...monthDays.map(day => `${day}/${month + 1}`)];
    rows.push(header);

    operators.forEach(op => {
        const row: any[] = [];
        row.push(op.fullName);

        monthDays.forEach(day => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (this.isHolidayOrWeekend(dateStr)) {
            row.push('');
            return;
        }

        const events = op.events.filter((e: any) =>
            e.date === dateStr ||
            (e.startDate && e.endDate && dateStr >= e.startDate && dateStr <= e.endDate)
        );

        if (!events.length) {
            row.push('');
            return;
        }

        const presenza = events.find((e: any) => e.tipologia === 'presenza');
        const assenza  = events.find((e: any) => e.tipologia === 'assenza');
        const malattia = events.find((e: any) => e.tipologia === 'malattia');

        if (malattia) {
            row.push('M');
            return;
        }

        if (assenza && assenza.title === 'Ferie') {
            row.push('F');
            return;
        }

        let cell = '';

        if (presenza) {
            const pStart = presenza.startHour?.slice(0, 5) ?? '';
            const pEnd   = presenza.endHour?.slice(0, 5) ?? '';
            cell = `${pStart} - ${pEnd}`.trim();
        }

        if (assenza) {
            const aStart = assenza.startHour?.slice(0, 5) ?? '';
            const aEnd   = assenza.endHour?.slice(0, 5) ?? '';
            const permesso = `P ${aStart} - ${aEnd}`.trim();

            cell = cell ? `${cell} (${permesso})` : permesso;
        }

        row.push(cell);
        });

        rows.push(row);
    });

    const wsCalendar: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);

    // =========================
    // FOGLIO 2 – RIEPILOGO
    // =========================
    const summaryRows: any[] = [];
    summaryRows.push([
        'Operatore',
        'Ore di ritardo',
        'Ore di straordinario',
        'Ore di permesso',
        'Uscite anticipate',
        'Giorni di ferie',
        'Giorni di malattia'
    ]);


    operators.forEach(op => {
        let lateMinutes = 0;
        let overtimeMinutes = 0;
        let permissionMinutes = 0;
        let vacationDays = 0;
        let sickDays = 0;
        let earlyExitMinutes = 0;

        const operatorStart = op.startTime;
        const operatorEnd   = op.endTime;

        monthDays.forEach(day => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (this.isHolidayOrWeekend(dateStr)) return;

        const events = op.events.filter((e: any) =>
            e.date === dateStr ||
            (e.startDate && e.endDate && dateStr >= e.startDate && dateStr <= e.endDate)
        );

        const presenza = events.find((e: any) => e.tipologia === 'presenza');
        const assenza  = events.find((e: any) => e.tipologia === 'assenza');
        const malattia = events.find((e: any) => e.tipologia === 'malattia');

        if (malattia) {
            sickDays++;
            return;
        }

        if (assenza && assenza.title === 'Ferie') {
            vacationDays++;
            return;
        }

        if (presenza) {
            const worked = this.utils.diffMinutes(presenza.startHour, presenza.endHour);
            const scheduled = this.utils.diffMinutes(operatorStart, operatorEnd);

            // ritardo
            if (presenza.startHour > operatorStart) {
                lateMinutes += this.utils.diffMinutes(operatorStart, presenza.startHour);
            }

            // straordinario
            if (worked > scheduled) {
                overtimeMinutes += worked - scheduled;
                console.log(scheduled);
            }
            if (presenza && presenza.startHour && presenza.endHour && operatorEnd) {

                // ⏳ USCITA ANTICIPATA
                if (presenza.endHour < operatorEnd) {
                    earlyExitMinutes += this.utils.diffMinutes(presenza.endHour, operatorEnd);
                }

            }
        }

        // permesso
        if (assenza && assenza.title !== 'Ferie') {
            permissionMinutes += this.utils.diffMinutes(assenza.startHour, assenza.endHour);
        }
        });

        summaryRows.push([
            op.fullName,
            this.utils.formatMinutesToHours(lateMinutes),
            this.utils.formatMinutesToHours(overtimeMinutes),
            this.utils.formatMinutesToHours(permissionMinutes),
            this.utils.formatMinutesToHours(earlyExitMinutes),
            vacationDays,
            sickDays
            ]);
        });

        const wsSummary: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(summaryRows);

        // =========================
        // WORKBOOK
        // =========================
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsCalendar, 'Calendario');
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Riepilogo Mensile');

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
