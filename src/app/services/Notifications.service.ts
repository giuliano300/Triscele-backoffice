import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notifications } from '../interfaces/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

    private apiUrl = API_URL + "notifications";
    
    constructor(private http: HttpClient) {}

    getNotifications(): Observable<Notifications[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Notifications[]>(this.apiUrl, { headers });
    }

    getAdminNotRead(): Observable<Notifications[]>{
      return this.http.get<Notifications[]>(this.apiUrl + "/getAdminNotRead");
    }

    getCustomerNotRead(customerId: string): Observable<Notifications[]>{
      return this.http.get<Notifications[]>(this.apiUrl + "/getCustomerNotRead/" + customerId);
    }

    getOperatorNotRead(operatorId: string): Observable<Notifications[]>{
      return this.http.get<Notifications[]>(this.apiUrl + "/getOperatorNotRead/" + operatorId);
    }

    markAsRead(id: string){
       return this.http.put(this.apiUrl + '/markAsRead/' + id, {});
    }

}
