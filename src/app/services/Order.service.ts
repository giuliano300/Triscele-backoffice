import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operators } from '../interfaces/operators';
import { Order } from '../interfaces/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

    private apiUrl = API_URL + "Orders";
    
    constructor(private http: HttpClient) {}

    getOrders(query: string = ''): Observable<any>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<any>(this.apiUrl + query, { headers });
    }

    getOrder(id: string): Observable<Order>{
      return this.http.get<Order>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setOrder(c: Order):Observable<Order>{
      return this.http.post<Order>(this.apiUrl, c);
    }

    updateOrder(c: Order):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
