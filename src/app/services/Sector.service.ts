import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sectors } from '../interfaces/sectors';

@Injectable({
  providedIn: 'root'
})
export class SectorService {

    private apiUrl = API_URL + "Sectors";
    
    constructor(private http: HttpClient) {}

    getSectors(): Observable<Sectors[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Sectors[]>(this.apiUrl, { headers });
    }

    getSector(id: string): Observable<Sectors>{
      return this.http.get<Sectors>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setSector(c: Sectors):Observable<Sectors>{
      return this.http.post<Sectors>(this.apiUrl, c);
    }

    updateSector(c: Sectors):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
