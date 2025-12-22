import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MiniCalendarEvent } from '../../../interfaces/miniCalendarEvent';
import { CalendarService } from '../../../services/Calendar.service';
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from "@angular/material/icon";
import { UtilsService } from '../../../services/utils.service';
import { ExcelService } from '../../../services/excel.service';

interface OperatorMonth {
  operatorId: string;
  fullName: string;
  startTime?: string;
  endTime?: string;
  events: MiniCalendarEvent[];
}

interface OperatorSummary {
  operatorId: string;
  fullName: string;
  lateHours: number;
  overtimeHours: number;
  permissionHours: number;
  earlyExitHours: number;
  vacationDays: number;
  sickDays: number;
}


@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatTooltipModule, MatIconModule],
  templateUrl: './mini-calendar.component.html',
  styleUrls: ['./mini-calendar.component.scss']
})
export class MiniCalendarComponent implements OnInit {
  monthDays: number[] = [];
  operators: OperatorMonth[] = [];
  currentMonth: number;
  currentYear: number;
  holidays: string[] = [];

  summaries: OperatorSummary[] = [];

  showSummary = false;

  constructor(private calendarService: CalendarService, private utils: UtilsService, private excelService: ExcelService) {
    const today = new Date();
    this.currentMonth = today.getMonth(); // 0-11
    this.currentYear = today.getFullYear();
  }


  ngOnInit(): void {
    this.generateMonthDays();
    this.loadCalendar();
    this.utils.getItalianHolidays(this.currentYear!).subscribe(holidays => {
      this.holidays = holidays;
    });
  }

  generateExcel() {
    this.excelService.exportMiniCalendar(
      this.operators,
      this.monthDays,
      this.currentMonth,
      this.currentYear
    );
  }

  isWeekendOrHoliday(day: number): boolean {
    const date = new Date(this.currentYear, this.currentMonth, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Domenica = 0, Sabato = 6
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const isHoliday = this.holidays.includes(dateStr);
    return isWeekend || isHoliday;
  }


  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }

  // Calcola giorni del mese corrente
  generateMonthDays() {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    this.monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  // Carica eventi dal backend
  loadCalendar() {
    this.calendarService.getMonthlyCalendarEvents(this.currentMonth + 1, this.currentYear).subscribe({
      next: (events) => {
        this.operators = this.groupByOperator(events.data);
        this.buildSummaries();
      },
      error: () => this.operators = []
    });
  }

  // Raggruppa eventi per operatore
  private groupByOperator(events: MiniCalendarEvent[]): OperatorMonth[] {
    //console.log(events);
    const map = new Map<string, OperatorMonth>();
    events.forEach(ev => {
      const key = ev.fullName;
      if (!map.has(key)) {
        map.set(key, {
          operatorId: ev.id,
          fullName: ev.fullName,
          startTime: ev.operatorStartTime,
          endTime: ev.operatorEndTime,
          events: []
        });
      }
      map.get(key)!.events.push(ev);
    });
    return Array.from(map.values());
  }

  // Restituisce eventi per giorno
  getEventsForDay(events: MiniCalendarEvent[], day: number): MiniCalendarEvent[] {
    const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return events.filter(e =>
      e.date === dateStr ||
      (e.startDate && e.endDate && dateStr >= e.startDate && dateStr <= e.endDate)
    );
  }

  getCellClasses(events: MiniCalendarEvent[]) {
    return {
      presence: events.some(e => e.tipologia === 'presenza'),
      illness: events.some(e => e.tipologia === 'malattia'),
      absence: events.some(e => e.tipologia === 'assenza')
    };
  }

  getPresence(events: MiniCalendarEvent[]) {
    return events.find(e => e.tipologia === 'presenza');
  }

  hasPermission(events: MiniCalendarEvent[]) {
    return events.some(e => e.tipologia === 'assenza' && e.title !== 'Ferie');
  }

  hasVacation(events: MiniCalendarEvent[]) {
    return events.some(e => e.tipologia === 'assenza' && e.title === 'Ferie');
  }

  hasIllness(events: MiniCalendarEvent[]) {
    return events.some(e => e.tipologia === 'malattia');
  }

  getTooltipForDay(events: MiniCalendarEvent[], day: number): string {
    // 1) Se è giorno non lavorativo -> tooltip fisso
    if (this.isWeekendOrHoliday(day)) {
      return 'Giorno non lavorativo';
    }

    // 2) Recupera tutti gli eventi del giorno
    const dayEvents = this.getEventsForDay(events, day) || [];
    if (!dayEvents.length) return ''; // niente tooltip

    // 3) Mappa ogni evento in una stringa descrittiva
    const parts: string[] = dayEvents.map(ev => {
      const tipo = ev.tipologia;
      let desc = '';

      if (tipo === 'presenza') {
        const start = this.formatHourMinute(ev.startHour) ?? '';
        const end = this.formatHourMinute(ev.endHour) ?? '';
        desc = `Presenza${start || end ? ` (${start} - ${end})` : ''}`;
      } else if (tipo === 'assenza') {
        // distinguo ferie / permesso
        if ((ev.title ?? '').toLowerCase() === 'ferie' || (ev.title ?? '').toLowerCase() === 'f') {
          desc = `Ferie`;
        } else {
          // permesso può avere orari parziali
          const start = this.formatHourMinute(ev.startHour) ?? '';
          const end = this.formatHourMinute(ev.endHour) ?? '';
          desc = `Permesso${start || end ? ` (${start} - ${end})` : ''}`;
        }
      } else if (tipo === 'malattia') {
        desc = `Malattia`;
        // se ci sono orari, mostriamoli (opzionale)
        if (ev.startHour || ev.endHour) {
          const start = this.formatHourMinute(ev.startHour) ?? '';
          const end = this.formatHourMinute(ev.endHour) ?? '';
          if (start || end) desc += ` (${start} - ${end})`;
        }
      } else {
        // fallback: titolo ed eventuali orari
        desc = ev.title ?? 'Evento';
        const start = this.formatHourMinute(ev.startHour) ?? '';
        const end = this.formatHourMinute(ev.endHour) ?? '';
        if (start || end) desc += ` (${start} - ${end})`;
      }

      // aggiungi note se presenti
      if (ev.notes) desc += `: ${ev.notes}`;

      return desc;
    });

    // 4) Unisci e ritorna
    return parts.join(' | ');
  }

  // Controlli ritardo e pausa
  isLate(
    entryTime?: string,
    operatorStartTime?: string,
    operatorEndTime?: string,
    exitTime?: string
  ): boolean {

    if (!entryTime || !operatorStartTime) return false;

    // ingresso
    const [eh, em] = entryTime.split(':').map(Number);
    const [sh, sm] = operatorStartTime.split(':').map(Number);

    const entryMinutes = eh * 60 + em;
    const startMinutes = sh * 60 + sm;

    // ritardo ingresso
    if (entryMinutes > startMinutes) {
      return true;
    }

    // uscita anticipata (se forniti)
    if (exitTime && operatorEndTime) {
      const [xh, xm] = exitTime.split(':').map(Number);
      const [eh2, em2] = operatorEndTime.split(':').map(Number);

      const exitMinutes = xh * 60 + xm;
      const endMinutes = eh2 * 60 + em2;

      if (exitMinutes < endMinutes) {
        return true;
      }
    }

    return false;
  }


  isLongLunch(start?: string, end?: string): boolean {
    if (!start || !end) return false;
    const diff = this.toSeconds(end) - this.toSeconds(start);
    return diff > 3600; // pausa > 1.30h
  }

  private toSeconds(time: string): number {
    const [h, m, s] = time.split(':').map(Number);
    return h * 3600 + m * 60 + (s || 0);
  }

  // Navigazione mesi
  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateMonthDays();
    this.loadCalendar();
    this.utils.getItalianHolidays(this.currentYear!).subscribe(holidays => {
      this.holidays = holidays;
    });
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateMonthDays();
    this.loadCalendar();
    this.utils.getItalianHolidays(this.currentYear!).subscribe(holidays => {
      this.holidays = holidays;
    });
  }

  // Formatta ore:minuti
  formatHourMinute(time?: string): string | null {
    if (!time) return null;
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  }

  getTooltip(ev: MiniCalendarEvent): string {
    let tooltip = ev.title;
    if (ev.notes) tooltip += `: ${ev.notes}`;
    if (ev.startHour && ev.endHour) {
      tooltip += ` (${this.formatHourMinute(ev.startHour)} - ${this.formatHourMinute(ev.endHour)})`;
    }
    return tooltip;
  }

  buildSummaries() {
    this.summaries = this.operators.map(op => {
      let lateMinutes = 0;
      let overtimeMinutes = 0;
      let permissionMinutes = 0;
      let earlyExitMinutes = 0;
      let vacationDays = 0;
      let sickDays = 0;

      op.events.forEach(ev => {
        if (ev.tipologia === 'malattia' && ev.startDate && ev.endDate) {
          sickDays += this.utils.countWorkingDays(
            ev.startDate,
            ev.endDate,
            this.currentMonth,
            this.currentYear,
            this.holidays
          );
        }

        if (ev.tipologia === 'assenza' && ev.title !== 'Ferie') {
          if (ev.startHour && ev.endHour) {
            permissionMinutes += this.utils.diffMinutes(ev.startHour, ev.endHour);
          }
        }

        if (ev.tipologia === 'assenza' && ev.title === 'Ferie' && ev.startDate && ev.endDate) {
          vacationDays += this.utils.countWorkingDays(
            ev.startDate,
            ev.endDate,
            this.currentMonth,
            this.currentYear,
            this.holidays
          );
        }

        if (ev.tipologia === 'presenza' && ev.startHour && ev.endHour) {
          if (ev.operatorStartTime && ev.startHour > ev.operatorStartTime) {
            lateMinutes += this.utils.diffMinutes(ev.operatorStartTime, ev.startHour);
          }

          if (ev.operatorEndTime && ev.endHour > ev.operatorEndTime) {
            overtimeMinutes += this.utils.diffMinutes(ev.operatorEndTime, ev.endHour);
          }

          if (ev.operatorEndTime && ev.endHour < ev.operatorEndTime) {
            earlyExitMinutes += this.utils.diffMinutes(ev.endHour, ev.operatorEndTime);
          }
        }
      });

      return {
        operatorId: op.operatorId,
        fullName: op.fullName,
        lateHours: +(lateMinutes / 60).toFixed(2),
        overtimeHours: +(overtimeMinutes / 60).toFixed(2),
        permissionHours: +(permissionMinutes / 60).toFixed(2),
        earlyExitHours: +(earlyExitMinutes / 60).toFixed(2),
        vacationDays,
        sickDays
      };
    });
  }

}
