import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login } from '../interfaces/Login';
import { Events } from '../interfaces/events';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

    private apiUrl = API_URL + "attendance/calendar";
    
    constructor(private http: HttpClient) {}

    calendar(operatorId?: string): Observable<Events[]>{
      let o = "";
      if(operatorId)
        o = "?operatorId=" + operatorId;

      return this.http.get<Events[]>(this.apiUrl + o);
    }

}
