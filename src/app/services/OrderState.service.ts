import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderState } from '../interfaces/order-state';

@Injectable({
  providedIn: 'root'
})
export class OrderStateService {

    private apiUrl = API_URL + "order-state";
    
    constructor(private http: HttpClient) {}

    getOrderStates(): Observable<OrderState[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<OrderState[]>(this.apiUrl, { headers });
    }

    getOrderState(id: string): Observable<OrderState>{
      return this.http.get<OrderState>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setgetOrderState(c: OrderState):Observable<OrderState>{
      return this.http.post<OrderState>(this.apiUrl, c);
    }

    updategetOrderState(c: OrderState):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
