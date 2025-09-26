import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customers } from '../interfaces/customers';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

    private apiUrl = API_URL + "Customers";
    
    constructor(private http: HttpClient) {}

    getCustomers(): Observable<Customers[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Customers[]>(this.apiUrl, { headers });
    }

    getCustomer(id: string): Observable<Customers>{
      return this.http.get<Customers>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setCustomer(c: Customers):Observable<Customers>{
      return this.http.post<Customers>(this.apiUrl, c);
    }

    updateCustomer(c: Customers):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
