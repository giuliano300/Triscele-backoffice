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
  events: MiniCalendarEvent[];
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

  constructor(private calendarService: CalendarService, private utils: UtilsService, private excelService: ExcelService) {
    const today = new Date();
    this.currentMonth = today.getMonth(); // 0-11
    this.currentYear = today.getFullYear();
  }


  ngOnInit(): void {
    this.generateMonthDays();
    this.loadCalendar();
    this.holidays = this.utils.getItalianHolidays(this.currentYear!);
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
      },
      error: () => this.operators = []
    });
  }

  // Raggruppa eventi per operatore
  private groupByOperator(events: MiniCalendarEvent[]): OperatorMonth[] {
    const map = new Map<string, OperatorMonth>();
    events.forEach(ev => {
      const key = ev.fullName;
      if (!map.has(key)) {
        map.set(key, {
          operatorId: ev.id,
          fullName: ev.fullName,
          events: []
        });
      }
      map.get(key)!.events.push(ev);
    });
    return Array.from(map.values());
  }

  // Restituisce evento per giorno
  getEventForDay(events: MiniCalendarEvent[], day: number): MiniCalendarEvent | undefined {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(this.currentMonth + 1).padStart(2, '0');
    const dateStr = `${this.currentYear}-${monthStr}-${dayStr}`;
    return events.find(e => e.date === dateStr || (e.startDate && e.endDate && dateStr >= e.startDate && dateStr <= e.endDate));
  }

  // Controlli ritardo e pausa
  isLate(entryTime?: string): boolean {
    if (!entryTime) return false;
    const [h, m] = entryTime.split(':').map(Number);
    return h > 9 || (h === 9 && m > 0); // ritardo dopo le 09:00
  }

  isLongLunch(start?: string, end?: string): boolean {
    if (!start || !end) return false;
    const diff = this.toSeconds(end) - this.toSeconds(start);
    return diff > 3600; // pausa > 1h
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
    this.holidays = this.utils.getItalianHolidays(this.currentYear!);
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
    this.holidays = this.utils.getItalianHolidays(this.currentYear!);
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
}
