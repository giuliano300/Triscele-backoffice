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
  lateHours: string;
  overtimeHours: string;
  permissionHours: string;
  earlyExitHours: string;
  vacationDays: number;
  sickDays: number;
  absenceUnjustified: number;
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
show: any;

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
        console.log(events);
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
      absence: events.some(e => e.tipologia === 'assenza'),
      unjustified: events.some(e => e.title.includes('ingiustificata'))
    };
  }

  getUnjustified(events: MiniCalendarEvent[]) {
    return events.find(e => e.tipologia === 'assenza' && e.title.includes('ingiustificata'));
  }

  getPresence(events: MiniCalendarEvent[]) {
    return events.find(e => e.tipologia === 'presenza');
  }

  hasPermission(events: MiniCalendarEvent[]) {
    return events.some(e => e.tipologia === 'assenza' && e.title !== 'Ferie'&& !e.title.includes('ingiustificata'));
  }

  hasUnjustified(events: MiniCalendarEvent[]) {
    return events.some(e => e.tipologia === 'assenza' && e.title.includes('ingiustificata'));
  }

  hasVacation(events: MiniCalendarEvent[]) {
    return events.some(e => e.tipologia === 'assenza' && e.title === 'Ferie');
  }

  hasIllness(events: MiniCalendarEvent[]) {
    return events.some(e => e.tipologia === 'malattia');
  }

  getTooltipForDay(events: MiniCalendarEvent[], day: number): string {
    if (this.isWeekendOrHoliday(day)) {
      return 'Giorno non lavorativo';
    }

    const dayEvents = this.getEventsForDay(events, day) || [];
    if (!dayEvents.length) return '';

    return dayEvents.map(ev => {
      if (ev.tipologia === 'presenza') {
        let text = 'Presenza';

        if (ev.startHour || ev.endHour) {
          text += `\n⏰ ${this.formatHourMinute(ev.startHour)} - ${this.formatHourMinute(ev.endHour) ?? 'in corso'}`;
        }

        if (ev.breaks?.length) {
          text += '\nPause';
          ev.breaks.forEach(b => {
            text += `\n⏸ ${this.formatHourMinute(b.start)} - ${this.formatHourMinute(b.end)}`;
          });
        }

        if(this.isLate(ev))
          text += "\nRitardo\n" + this.utils.calculateEventDelay(ev) + " min";

        return text;
      }

      if (ev.tipologia === 'assenza') {
        return ev.title ?? 'Assenza';
      }

      if (ev.tipologia === 'malattia') {
        return 'Malattia';
      }

      return ev.title ?? '';
    }).join('\n────────\n');
  }

  // Controlli ritardo e pausa
  isLate(
    ev: MiniCalendarEvent
  ): boolean {

    if (this.utils.calculateEventDelay(ev) > 0)
      return true;
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
      let absenceUnjustified = 0;

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

        if (ev.tipologia === 'assenza' && ev.title.includes('ingiustificata') && ev.startDate && ev.endDate) {
          absenceUnjustified += this.utils.countWorkingDays(
            ev.startDate,
            ev.endDate,
            this.currentMonth,
            this.currentYear,
            this.holidays
          );
        }

        let minLate =  this.utils.calculateEventDelay(ev)

        if (ev.tipologia === 'presenza' && ev.startHour && ev.endHour) {
          if (ev.operatorStartTime) {
            lateMinutes += minLate;
          }

          if (ev.operatorEndTime && ev.endHour > ev.operatorEndTime && minLate == 0) {
            overtimeMinutes += this.utils.calculateOvertime(ev);
          }

          if (ev.operatorEndTime && ev.endHour < ev.operatorEndTime) {
            earlyExitMinutes += this.utils.diffMinutes(ev.endHour, ev.operatorEndTime);
          }
        }
      });

      return {
        operatorId: op.operatorId,
        fullName: op.fullName,
        lateHours: this.utils.formatMinutesToHours(lateMinutes),
        overtimeHours: this.utils.formatMinutesToHours(overtimeMinutes),
        permissionHours: this.utils.formatMinutesToHours(permissionMinutes),
        earlyExitHours: this.utils.formatMinutesToHours(earlyExitMinutes),        
        vacationDays,
        sickDays,
        absenceUnjustified
      };
    });
  }

}
