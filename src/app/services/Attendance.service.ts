import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance } from '../interfaces/attendance';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

    private apiUrl = API_URL + "attendance";
    
    constructor(private http: HttpClient) {}

    getAttendances(operatorId?: string): Observable<Attendance[]>{
      let o = "";
      if(operatorId)
        o = "?operatorId=" + operatorId;

      return this.http.get<Attendance[]>(this.apiUrl + o);
    }

    getAttendance(id: string): Observable<Attendance>{
      return this.http.get<Attendance>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      return this.http.delete<boolean>(this.apiUrl + "/" + id);
    }
  
    setAttendance(c: Attendance):Observable<Attendance>{
      return this.http.post<Attendance>(this.apiUrl, c);
    }

    updateAttendance(c: Attendance):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
