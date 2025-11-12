import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { MatCardModule } from '@angular/material/card';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions } from '@fullcalendar/core';
import { CalendarService } from '../../services/Calendar.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddUpdateDeleteAttendanceDialogComponent } from '../../add-update-delete-attendance-dialog/add-update-delete-attendance-dialog.component';
import { AttendanceService } from '../../services/Attendance.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, MatCardModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  constructor(
    private router: Router,
    private calendarService: CalendarService, 
    private dialog: MatDialog,
    private attendanceService: AttendanceService
  ) {}

  showFullName: boolean = false; 

  operatorId: string = '';

  @ViewChild('fullCalendar') calendarComponent!: FullCalendarComponent;
  events: any[] = [];
  
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
      const props: any = info.event.extendedProps;

      if (!props || info.event.title?.includes('Presenza')) return;

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
      if (window.innerWidth < 768 && info.view.type !== 'dayGridDay') {
        info.view.calendar.changeView('dayGridDay');
      }
      if (window.innerWidth >= 768 && info.view.type !== 'dayGridMonth') {
        info.view.calendar.changeView('dayGridMonth');
      }
    },
    dateClick: (info) => {
      this.openNewEditDeleteAttendance(info.dateStr);
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
  }

  openEditEvent(event: any) {
    //console.log(event._def.extendedProps);
    const id = event._def.extendedProps.id;

    if(event._def.extendedProps.tipologia == "presenza"){
      this.openNewEditDeleteAttendance(event._def.extendedProps.date, id);
      return;
    }
        
    let data = 
    {
      title: "Vuoi modificare l'assenza in calendario?", 
      description: "Se la modifichi verrà rimesso in attesa di validazione.",
      confirm: "Conferma"
    };
    
    if(event._def.extendedProps.tipologia == "malattia")
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
        if(event._def.extendedProps.tipologia == "assenza")
            this.router.navigate(["operator/permission-holiday/add/" + id]);
        if(event._def.extendedProps.tipologia == "malattia")
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
      this.calendarOptions.events = events.map((e: any) => {
        const isPresence = e.title.includes('Presenza');
        const isPermission = e.title.includes('Permesso');
        const isAllDay = true; 

        const start = new Date(e.start);
        let end = new Date(e.end);

        if (isAllDay && end) {
          end = new Date(end);
          end.setDate(end.getDate() + 1);
        }

        let extendedProps: any = {};

        if (!isPresence) {
          extendedProps = {
            fullName: e.fullName,
            reason: e.reason,
            type: e.type,
            start: !isPermission ? start.toLocaleDateString('it-IT') : undefined,
            end: !isPermission ? end.toLocaleDateString('it-IT') : undefined,
            dataPermesso: isPermission ? start.toLocaleDateString('it-IT') : undefined,
            startHour: isPermission ? e.startHour : undefined,
            endHour: isPermission ? e.endHour : undefined,
            id: e.id,
            tipologia: e.tipologia,
            date: start
          };
        }
        else
          extendedProps = {
            id: e.id,
            tipologia: e.tipologia,
            date: start
          }

        return {
          color: e.color ?? '#90CAF9',
          title: this.showFullName ? `${e.title}${e.fullName ? ' - ' + e.fullName : ''}` : e.title,
          start,
          end,
          allDay: isAllDay,
          extendedProps
        };
      });
    });
  }
}
