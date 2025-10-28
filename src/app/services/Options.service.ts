import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Options } from '../interfaces/options';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {

    private apiUrl = API_URL + "options";
    
    constructor(private http: HttpClient) {}

    getOptions(): Observable<Options[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Options[]>(this.apiUrl, { headers });
    }

    getProductsOption(id: string): Observable<Options>{
      return this.http.get<Options>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setOptions(c: Options):Observable<Options>{
      return this.http.post<Options>(this.apiUrl, c);
    }

    updateOptions(c: Options):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
