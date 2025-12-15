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
import { UtilsService } from '../../services/utils.service';

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
    private operatorService: OperatorService,
    private utils: UtilsService
  ) {}

  showFullName: boolean = false; 
  operatorName: string = '';
  holidays: string[] = [];

  @ViewChild('fullCalendar') calendarComponent!: FullCalendarComponent;
  events: any[] = [];


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
    eventDidMount: (info) => {
      const infos: any = info.event.extendedProps;

      const props = infos.originalEvent;

      const tooltipContent = `
        <div style="font-size:14px; line-height:1.8; min-width:200px;">
          ${props.fullName ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><strong>Nome:</strong><span>${props.fullName}</span></div>` : ''}
          ${props.type ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><strong>Tipo:</strong><span>${props.type}</span></div>` : ''}
          ${props.reason ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><strong>Motivo:</strong><span>${props.reason}</span></div>` : ''}
          ${props.start ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><strong>Inizio:</strong><span>${props.start}</span></div>` : ''}
          ${props.end ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><strong>Fine:</strong><span>${props.end}</span></div>` : ''}
          ${props.dataPermesso ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><strong>Data:</strong><span>${props.dataPermesso}</span></div>` : ''}
          ${props.startHour ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><strong>Dalle ore:</strong><span>${props.startHour}</span></div>` : ''}
          ${props.endHour ? `<div style="display:flex; justify-content:space-between;"><strong>Alle ore:</strong><span>${props.endHour}</span></div>` : ''}
        </div>
      `;

      tippy(info.el, {
        content: tooltipContent,
        allowHTML: true,
        placement: 'top',
        theme: 'custom-tooltip'
      });
    },
    datesSet: (info) => {
      const year = info.view.currentStart.getFullYear();
      this.holidays = this.utils.getItalianHolidays(year);

      if (window.innerWidth < 768 && info.view.type !== 'dayGridDay') {
        info.view.calendar.changeView('dayGridDay');
      }
      if (window.innerWidth >= 768 && info.view.type !== 'dayGridMonth') {
        info.view.calendar.changeView('dayGridMonth');
      }
    },
    dayCellDidMount: (arg: any) => {
        const y = arg.date.getFullYear();
        const m = String(arg.date.getMonth() + 1).padStart(2, '0');
        const d = String(arg.date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        this.holidays = this.utils.getItalianHolidays(y);
  
        const day = arg.date.getDay();
        const isSunday = day === 0;
        const isSaturday = day === 6;
        const isHoliday = this.holidays.includes(dateStr);

        if (isSunday || isSaturday || isHoliday) {
          arg.el.style.backgroundColor = this.utils.getDisabledColor();
          arg.el.style.pointerEvents = 'none';
          arg.el.style.opacity = '0.95';
        }
    }
  };

  // -----------------------
  // INIT
  // -----------------------

  ngOnInit(): void {
    const year = new Date().getFullYear();
    this.holidays = this.utils.getItalianHolidays(year);

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

      //const isPresence = e.title?.includes('Presenza');
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
