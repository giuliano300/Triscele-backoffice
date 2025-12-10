import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { MatCardModule } from '@angular/material/card';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { CalendarService } from '../../services/Calendar.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import interactionPlugin from '@fullcalendar/interaction';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService } from '../../services/Attendance.service';
import { OperatorService } from '../../services/Operator.service';
import { Operators } from '../../interfaces/operators';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, MatCardModule],
  templateUrl: './operator-calendar.component.html',
  styleUrls: ['./operator-calendar.component.scss']
})
export class OperatorCalendarComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private calendarService: CalendarService, 
    private dialog: MatDialog,
    private attendanceService: AttendanceService,
    private operatorService: OperatorService
  ) {}

  showFullName: boolean = false; 
  operatorName: string = '';
  holidays: string[] = [];

  @ViewChild('fullCalendar') calendarComponent!: FullCalendarComponent;
  events: any[] = [];

  // -----------------------
  // FESTIVITÀ ITALIANE
  // -----------------------

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

  // -----------------------
  // CALENDAR OPTIONS
  // -----------------------

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dayMaxEvents: true,
    weekends: true,
    events: [],
    plugins: [dayGridPlugin, interactionPlugin],
    locale: 'it',
    buttonText: {
      today: 'Oggi',
      month: 'Mese',
      week: 'Settimana',
      day: 'Giorno',
      list: 'Lista'
    },

    selectAllow: (info) => {
      const d = new Date(info.startStr);
      return !(d.getDay() === 0 || d.getDay() === 6 || this.holidays.includes(info.startStr));
    },

    // Tooltip
    eventDidMount: (info) => {
      const props: any = info.event.extendedProps['originalEvent'];

      const tooltipContent = `
        <div style="font-size:14px; line-height:1.8; min-width:220px;">
          ${props.fullName ? `<div><strong>Nome:</strong> ${props.fullName}</div>` : ''}
          ${props.type ? `<div><strong>Tipo:</strong> ${props.type}</div>` : ''}
          ${props.reason ? `<div><strong>Motivo:</strong> ${props.reason}</div>` : ''}
          ${props.originalStart ? `<div><strong>Inizio:</strong> ${props.originalStart}</div>` : ''}
          ${props.originalEnd ? `<div><strong>Fine:</strong> ${props.originalEnd}</div>` : ''}
          ${props.dataPermesso ? `<div><strong>Data:</strong> ${props.dataPermesso}</div>` : ''}
          ${props.startHour ? `<div><strong>Dalle ore:</strong> ${props.startHour}</div>` : ''}
          ${props.endHour ? `<div><strong>Alle ore:</strong> ${props.endHour}</div>` : ''}
        </div>
      `;

      tippy(info.el, {
        content: tooltipContent,
        allowHTML: true,
        placement: 'top',
        theme: 'custom-tooltip'
      });
    },
    dayCellDidMount: (arg: any) => {
      const dateStr = arg.date.toISOString().split('T')[0];
      const day = arg.date.getDay();

      const isSunday = day === 0;
      const isSaturday = day === 6;
      const isHoliday = this.holidays.includes(dateStr);

      if (isSunday || isSaturday || isHoliday) {
        arg.el.style.backgroundColor = '#fcfcfcff';
        arg.el.style.pointerEvents = 'none';      // rendere non cliccabile
        arg.el.style.opacity = '0.95';
      }
    },
    datesSet: (info) => {
      const year = info.start.getFullYear();
      this.holidays = this.getItalianHolidays(year);

      if (window.innerWidth < 768 && info.view.type !== 'dayGridDay') {
        info.view.calendar.changeView('dayGridDay');
      }
      if (window.innerWidth >= 768 && info.view.type !== 'dayGridMonth') {
        info.view.calendar.changeView('dayGridMonth');
      }
    },
  };

  // -----------------------
  // INIT
  // -----------------------

  ngOnInit(): void {
    const year = new Date().getFullYear();
    this.holidays = this.getItalianHolidays(year);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) this.router.navigate(["access-denied"]);

      this.operatorService.getOperator(id!).subscribe((data: Operators) => {
        this.loadEvents(id!);
        this.operatorName = data.businessName;
      });
    });
  }

  // -----------------------
  // CARICAMENTO EVENTI
  // -----------------------

  loadEvents(operatorId?: string) {
    this.calendarService.calendar(operatorId).subscribe(events => {
      this.events = events;
      this.applyEventsToCalendar();
    });
  }

  // -----------------------
  // SPLIT EVENTI + TOOLTIP COMPLETO
  // -----------------------

  applyEventsToCalendar() {

    const splitEvents: EventInput[] = [];

    for (const e of this.events) {

      const isPresence = e.title?.includes('Presenza');
      const isPermission = e.title?.includes('Permesso');

      const originalStartDate = new Date(e.start);
      const originalEndDate = e.end ? new Date(e.end) : new Date(e.start);

      const originalStartStr = originalStartDate.toLocaleDateString('it-IT');
      const originalEndStr = originalEndDate.toLocaleDateString('it-IT');

      let loop = new Date(originalStartDate);

      while (loop <= originalEndDate) {

        const dateStr = loop.toISOString().split('T')[0];
        const day = loop.getDay();

        const isHoliday = this.holidays.includes(dateStr);
        const isSaturday = day === 6;
        const isSunday = day === 0;

        if (isSaturday || isSunday || isHoliday) {
          loop.setDate(loop.getDate() + 1);
          continue;
        }

        const dayStart = new Date(loop);
        const dayEnd = new Date(loop);
        dayEnd.setDate(dayEnd.getDate() + 1);

        splitEvents.push({
          title: this.showFullName ? `${e.title}${e.fullName ? ' - ' + e.fullName : ''}` : e.title,
          start: dayStart,
          end: dayEnd,
          allDay: true,
          color: e.color ?? '#90CAF9',

          extendedProps: {
            originalEvent: {
              fullName: e.fullName,
              reason: e.reason,
              type: e.type,
              originalStart: originalStartStr,
              originalEnd: originalEndStr,
              dataPermesso: isPermission ? originalStartStr : undefined,
              startHour: e.startHour,
              endHour: e.endHour,
              id: e.id,
              tipologia: e.tipologia
            }
          }
        });

        loop.setDate(loop.getDate() + 1);
      }
    }

    this.calendarOptions = {
      ...this.calendarOptions,
      events: splitEvents
    };
  }

  back() {
    this.router.navigate(["operators"]);
  }
}
