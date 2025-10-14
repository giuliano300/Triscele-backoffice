import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agents } from '../interfaces/agents';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

    private apiUrl = API_URL + "Agents";
    
    constructor(private http: HttpClient) {}

    getAgents(): Observable<Agents[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Agents[]>(this.apiUrl, { headers });
    }

    getAgent(id: string): Observable<Agents>{
      return this.http.get<Agents>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setAgent(c: Agents):Observable<Agents>{
      return this.http.post<Agents>(this.apiUrl, c);
    }

    updateAgent(c: Agents):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
