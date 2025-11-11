import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatCardModule } from '@angular/material/card'; // Corretto import
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions } from '@fullcalendar/core';
import { CalendarService } from '../../services/Calendar.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

@Component({
  selector: 'app-calendar',
  standalone: true, // necessario se usi imports direttamente
  imports: [FullCalendarModule, MatCardModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'] // correzione da styleUrl -> styleUrls
})
export class CalendarComponent implements OnInit {

  showFullName: boolean = false; 
  
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dayMaxEvents: true,
    weekends: true,
    events: [],
    plugins: [dayGridPlugin],
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

      // Contenuto del tooltip
      let tooltipContent = `<strong>${info.event.title}</strong><br>`;
      if (props.fullName) tooltipContent += `Nome: ${props.fullName}<br>`;
      if (props.type) tooltipContent += `Tipo: ${props.type}<br>`;
      if (props.reason) tooltipContent += `Motivo: ${props.reason}<br>`;
      if (props.start) tooltipContent += `Inizio: ${props.start}<br>`;
      if (props.end) tooltipContent += `Fine: ${props.end}<br>`;

      // Inizializza tippy sul DOM dell'evento
      tippy(info.el, {
        content: tooltipContent,
        allowHTML: true,
        placement: 'top',
        theme: 'custom-tooltip'
      });
    }
  };

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    let operatorId = '';
    const isOperator = localStorage.getItem('isOperator') === 'true';
    if (isOperator) {
      const o = JSON.parse(localStorage.getItem('operator') || '{}');
      operatorId = o.sub;  
    }
    this.loadEvents(operatorId);
  }

  loadEvents(operatorId?: string) {
    this.calendarService.calendar(operatorId).subscribe(events => {
      console.log(JSON.stringify(events));
      this.calendarOptions.events = events.map((e: any) => ({
        ...e,
        title: this.showFullName
          ? `${e.title} - ${e.fullName ?? ''}`
          : e.title,
        allDay: true,
        extendedProps: {
          fullName: e.fullName,
          reason: e.reason,
          type: e.type,
          start: e.title == "Presenza" ? "" : new Date(e.start).toLocaleDateString('it-IT'),
          end: e.title == "Presenza" ? "" : new Date(e.end).toLocaleDateString('it-IT')
        }
      }));
    });
  }
}
