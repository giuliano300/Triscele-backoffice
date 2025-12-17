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
import { AddUpdateDeleteAttendanceDialogComponent } from '../../add-update-delete-attendance-dialog/add-update-delete-attendance-dialog.component';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

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
    },
    eventClick: (info) => {
      this.openEditEvent(info.event);
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

      const isPermission = e.title?.includes('Permesso');

      const startDate = new Date(e.start);
      const endDate = e.end ? new Date(e.end) : new Date(e.start);

      // Normalizza ore (evita problemi timezone)
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const originalStartStr = startDate.toLocaleDateString('it-IT');
      const originalEndStr = endDate.toLocaleDateString('it-IT');

      let loop = new Date(startDate);

      while (loop <= endDate) {

        const y = loop.getFullYear();
        const m = String(loop.getMonth() + 1).padStart(2, '0');
        const d = String(loop.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        this.holidays = this.utils.getItalianHolidays(y);

        const day = loop.getDay();
        const isSaturday = day === 6;
        const isSunday = day === 0;
        const isHoliday = this.holidays.includes(dateStr);

        // ⛔ Salta completamente weekend e festivi
        if (isSaturday || isSunday || isHoliday) {
          loop.setDate(loop.getDate() + 1);
          continue;
        }

        const dayStart = new Date(loop);
        const dayEnd = new Date(loop);
        dayEnd.setDate(dayEnd.getDate() + 1);

        splitEvents.push({
          title: this.showFullName
            ? `${e.title}${e.fullName ? ' - ' + e.fullName : ''}`
            : e.title,

          start: dayStart,
          end: dayEnd,
          allDay: true,
          color: e.color ?? '#90CAF9',

          extendedProps: {
            originalEvent: {
              id: e.id,
              fullName: e.fullName,
              reason: e.reason,
              type: e.type,
              tipologia: e.tipologia,
              originalStart: originalStartStr,
              originalEnd: originalEndStr,
              dataPermesso: isPermission ? originalStartStr : undefined,
              startHour: e.startHour,
              endHour: e.endHour
            }
          }
        });

        loop.setDate(loop.getDate() + 1);
      }
    }

  // 🔥 assegna SOLO alla fine
  this.calendarOptions = {
    ...this.calendarOptions,
    events: splitEvents
  };
}

  openEditEvent(event: any) {
    //console.log(event._def.extendedProps);
    const id = event._def.extendedProps.originalEvent.id;

    if(event._def.extendedProps.originalEvent.tipologia == "presenza"){
      this.openNewEditDeleteAttendance(id);
      return;
    }
  }


  openNewEditDeleteAttendance(id?: string) {

    const a = this.attendanceService.getAttendance(id!).subscribe((data: any) =>{
      const dialogRef = this.dialog.open(AddUpdateDeleteAttendanceDialogComponent, {
        width: '550px',
        data: {date: data.date, id: id}
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) 
        {
          //MODIFICA O ELIMINA
          if(id)
          {
            if(result == "delete"){
              this.attendanceService.delete(id).subscribe((data:any) => {
                this.loadEvents();
              })
            }
            else
            {
              result._id = id;
              result.operatorId = data.operatorId._id;
              this.attendanceService.updateAttendance(result).subscribe((data:any) =>{
                this.loadEvents();
              })
            }
          }
        } 
        else 
        {
          console.log("Close");
        }
      });
    })

  }


  back() {
    this.router.navigate(["operators"]);
  }
}
