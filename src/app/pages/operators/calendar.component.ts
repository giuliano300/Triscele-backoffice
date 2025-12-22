import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { MatCardModule } from '@angular/material/card';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { CalendarService } from '../../services/Calendar.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddUpdateDeleteAttendanceDialogComponent } from '../../add-update-delete-attendance-dialog/add-update-delete-attendance-dialog.component';
import { AttendanceService } from '../../services/Attendance.service';
import { UtilsService } from '../../services/utils.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, MatCardModule, NgIf],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  constructor(
    private router: Router,
    private calendarService: CalendarService, 
    private dialog: MatDialog,
    private attendanceService: AttendanceService,
    private utils: UtilsService
  ) {}

  showFullName: boolean = false; 
  showCalendar: boolean = false;

  operatorId: string = '';

  @ViewChild('fullCalendar') calendarComponent!: FullCalendarComponent;
  events: any[] = [];
  holidays: string[] | undefined = [];
  
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
    eventDidMount: (info) => {
      const infos: any = info.event.extendedProps;

      const props = infos.originalEvent;
      //alert(info);
      //if (!props || info.event.title?.includes('Presenza')) return;

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
    dateClick: (info) => {
      //this.openNewEditDeleteAttendance(info.dateStr);
    },

    eventClick: (info) => {
      this.openEditEvent(info.event);
    }
  };


  ngOnInit(): void {
    const isOperator = localStorage.getItem('isOperator') === 'true';
    if (isOperator) {
      const o = JSON.parse(localStorage.getItem('operator') || '{}');
      this.operatorId = o.sub;  
    }
    this.loadEvents(this.operatorId);
    //this.applyEventsToCalendar();
  }

  openEditEvent(event: any) {
    //console.log(event._def.extendedProps);
    const id = event._def.extendedProps.originalEvent.id;

    if(event._def.extendedProps.originalEvent.tipologia == "presenza"){
      //this.openNewEditDeleteAttendance(event._def.extendedProps.date, id);
      return;
    }
        
    let data = 
    {
      title: "Vuoi modificare l'assenza in calendario?", 
      description: "Se la modifichi verrà rimesso in attesa di validazione.",
      confirm: "Conferma"
    };
    
    if(event._def.extendedProps.originalEvent.tipologia == "malattia")
    {
      data.title =  "Vuoi modificare l'assenza per malattia in calendario?"
      data.description = "La modifica non dovrà essere validata dall'amministrazione.";
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '550px',
      data: data
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) 
      {
        localStorage.setItem("back-calendar", "true");
        if(event._def.extendedProps.originalEvent.tipologia == "assenza")
            this.router.navigate(["operator/permission-holiday/add/" + id]);
        if(event._def.extendedProps.originalEvent.tipologia == "malattia")
            this.router.navigate(["operator/illness/add/" + id]);
        
      } 
      else 
      {
        //console.log("Close");
      }
    });
  }

  openNewEditDeleteAttendance(date: string, id?: string) {
    const dialogRef = this.dialog.open(AddUpdateDeleteAttendanceDialogComponent, {
      width: '550px',
      data: {date: date, id: id}
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) 
      {
        //MODIFICA O ELIMINA
        if(id)
        {
          if(result == "delete"){
            this.attendanceService.delete(id).subscribe((data:any) => {
              this.loadEvents(this.operatorId);
            })
          }
          else
          {
            result._id = id;
            result.operatorId = this.operatorId;
            this.attendanceService.updateAttendance(result).subscribe((data:any) =>{
              this.loadEvents(this.operatorId);
            })
          }
        }
        else
        {
          result.operatorId = this.operatorId;
          this.attendanceService.setAttendance(result).subscribe((data:any) =>{
            this.loadEvents(this.operatorId);
          })
        }
      } 
      else 
      {
        console.log("Close");
      }
    });
  }


  loadEvents(operatorId?: string) {
    this.calendarService.calendar(operatorId).subscribe(events => {
      this.events = events;
      this.applyEventsToCalendar();
    });
  }

  async applyEventsToCalendar() {

    const splitEvents: EventInput[] = [];
    if (!this.events || this.events.length === 0) return;

    // 🔹 cache festività per anno
    const holidayCache = new Map<number, string[]>();

    const getHolidaysForYear = async (year: number): Promise<string[]> => {
      if (!holidayCache.has(year)) {
        const holidays = await this.utils.getItalianHolidays(year).toPromise();
        holidayCache.set(year, holidays!);
      }
      return holidayCache.get(year)!;
    };

    for (const e of this.events) {

      const isPermission = e.title?.includes('Permesso');

      const originalStartDate = new Date(e.start);
      const originalEndDate = e.end
        ? new Date(e.end)
        : new Date(e.start);

      originalStartDate.setHours(0,0,0,0);
      originalEndDate.setHours(0,0,0,0);

      const originalStartStr = originalStartDate.toLocaleDateString('it-IT');
      const originalEndStr = originalEndDate.toLocaleDateString('it-IT');

      let loop = new Date(originalStartDate);

      while (loop <= originalEndDate) {

        const y = loop.getFullYear();
        const m = String(loop.getMonth() + 1).padStart(2, '0');
        const d = String(loop.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        // ✅ festività GARANTITE
        const holidays = await getHolidaysForYear(y);

        const day = loop.getDay();
        const isSaturday = day === 6;
        const isSunday = day === 0;
        const isHoliday = holidays.includes(dateStr);

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
    this.showCalendar = true;

    // 🔥 assegna UNA SOLA VOLTA
    this.calendarOptions = {
      ...this.calendarOptions,
      events: splitEvents
    };
  }

}
