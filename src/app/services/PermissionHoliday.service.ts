import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { PermissionHoliday } from '../interfaces/permissionHoliday';

@Injectable({
  providedIn: 'root'
})
export class PermissionHolidayService {
    private pendingChangedSource = new BehaviorSubject<void>(undefined);
    pendingChanged$ = this.pendingChangedSource.asObservable();

    private apiUrl = API_URL + "permission-holiday";
    
    constructor(private http: HttpClient) {}

    getPermissionHolidays(operatorId?: string): Observable<PermissionHoliday[]>{
      let o = "";
      if(operatorId)
        o = "?operatorId=" + operatorId;

      return this.http.get<PermissionHoliday[]>(this.apiUrl + o);
    }

    getPermissionHoliday(id: string): Observable<PermissionHoliday>{
      return this.http.get<PermissionHoliday>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setPermissionHoliday(c: PermissionHoliday):Observable<PermissionHoliday>{
      return this.http.post<PermissionHoliday>(this.apiUrl, c);
    }

    updatePermissionHoliday(c: PermissionHoliday):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

    approveOrNotPermissionHoliday(c: PermissionHoliday):Observable<any>{
      return this.http.put<any>(this.apiUrl + "/approveOrNotPermissionHoliday/" + c._id, c);
    }

    countPending():Observable<number>{
      return this.http.get<number>(this.apiUrl + "/count-pending");
    }

    notifyPendingChanged() {
      this.pendingChangedSource.next();
    }

}
