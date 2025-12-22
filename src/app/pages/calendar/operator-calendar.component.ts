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
import { NgIf } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, MatCardModule, NgIf],
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
  holidays: string[] | undefined = [];

  @ViewChild('fullCalendar') calendarComponent!: FullCalendarComponent;
  events: any[] = [];

  showCalendar: boolean = false;

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
      return !(d.getDay() === 0 || d.getDay() === 6 || this.holidays!.includes(info.startStr));
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
    datesSet: async (info) => {
      const year = info.view.currentStart.getFullYear();
      this.holidays = await this.utils.getItalianHolidays(year).toPromise();

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

      const day = arg.date.getDay();
      const isSunday = day === 0;
      const isSaturday = day === 6;
      const isHoliday = this.holidays!.includes(dateStr);

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
    this.utils.getItalianHolidays(year).subscribe(holidays => {
        this.holidays = holidays;
      });

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
private holidayCache = new Map<number, string[]>(); // cache globale delle festività

async applyEventsToCalendar() {
  if (!this.events || this.events.length === 0) return;

  const splitEvents: EventInput[] = [];

  // 1️⃣ Trova tutti gli anni coinvolti
  const years = Array.from(
    new Set(
      this.events.flatMap(e => [
        new Date(e.start).getFullYear(),
        e.end ? new Date(e.end).getFullYear() : null
      ].filter(y => y !== null))
    )
  ) as number[];

  // 2️⃣ Carica festività per ogni anno solo se non in cache
  await Promise.all(
    years.map(async y => {
      if (!this.holidayCache.has(y)) {
        const holidays = await firstValueFrom(this.utils.getItalianHolidays(y));
        this.holidayCache.set(y, holidays ?? []);
      }
    })
  );

  // 3️⃣ Splitta gli eventi per giorno
  for (const e of this.events) {
    const isPermission = e.title?.includes('Permesso');

    const startDate = new Date(e.start);
    const endDate = e.end ? new Date(e.end) : new Date(e.start);
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    const originalStartStr = startDate.toLocaleDateString('it-IT');
    const originalEndStr = endDate.toLocaleDateString('it-IT');

    let loop = new Date(startDate);
    while (loop <= endDate) {
      const y = loop.getFullYear();
      const m = String(loop.getMonth() + 1).padStart(2, '0');
      const d = String(loop.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const day = loop.getDay();
      const isSaturday = day === 6;
      const isSunday = day === 0;
      const isHoliday = this.holidayCache.get(y)?.includes(dateStr);

      if (isSaturday || isSunday || isHoliday) {
        loop.setDate(loop.getDate() + 1);
        continue;
      }

      splitEvents.push({
        title: this.showFullName
          ? `${e.title}${e.fullName ? ' - ' + e.fullName : ''}`
          : e.title,
        start: new Date(loop),
        end: new Date(loop),
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

  // 4️⃣ Aggiorna il calendario SOLO alla fine
  this.calendarOptions = {
    ...this.calendarOptions,
    events: splitEvents
  };
  this.showCalendar = true;
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
