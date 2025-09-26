import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operators } from '../interfaces/operators';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {

    private apiUrl = API_URL + "Operators";
    
    constructor(private http: HttpClient) {}

    getOperators(): Observable<Operators[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Operators[]>(this.apiUrl, { headers });
    }

    getOperator(id: string): Observable<Operators>{
      return this.http.get<Operators>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setOperator(c: Operators):Observable<Operators>{
      return this.http.post<Operators>(this.apiUrl, c);
    }

    updateOperator(c: Operators):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
