import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Events } from '../interfaces/events';
import { MiniCalendarEvent } from '../interfaces/miniCalendarEvent';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

    private apiUrl = API_URL + "attendance/calendar";
    private apiUrlMiniCalendar = API_URL + "attendance/month-events";
    
    constructor(private http: HttpClient) {}

    calendar(operatorId?: string): Observable<Events[]>{
      let o = "";
      if(operatorId)
        o = "?operatorId=" + operatorId;

      return this.http.get<Events[]>(this.apiUrl + o);
    }

    getMonthlyCalendarEvents(month: number, year: number, operatorId?: string): Observable<{ success: boolean, data: MiniCalendarEvent[] }> {
      let params = new HttpParams()
        .set('month', month.toString())
        .set('year', year.toString());
      
      if (operatorId) {
        params = params.set('operatorId', operatorId);
      }

      return this.http.get<{ success: boolean, data: MiniCalendarEvent[] }>(`${this.apiUrlMiniCalendar}`, { params });
    }

}
