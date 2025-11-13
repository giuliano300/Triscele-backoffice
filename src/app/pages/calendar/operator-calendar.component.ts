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
import { ActivatedRoute, Router } from '@angular/router';
import { AddUpdateDeleteAttendanceDialogComponent } from '../../add-update-delete-attendance-dialog/add-update-delete-attendance-dialog.component';
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
  };


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
       const id = params.get('id');

      if (!id)
        this.router.navigate(["access-denied"]);

      this.operatorService.getOperator(id!)
        .subscribe((data: Operators) => {
        this.loadEvents(id!);
        this.operatorName = data.businessName;
      });
    
    })
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
            fullName: e.fullName,
            startHour: e.startHour,
            endHour: e.endHour,
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

  back(){
    this.router.navigate(["operators"]);
  }
}
