import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Illness } from '../interfaces/Illness';

@Injectable({
  providedIn: 'root'
})
export class IllnessService {

    private apiUrl = API_URL + "illness";
    
    constructor(private http: HttpClient) {}

    getIllnesss(operatorId?: string): Observable<Illness[]>{
      let o = "";
      if(operatorId)
        o = "?operatorId=" + operatorId;

      return this.http.get<Illness[]>(this.apiUrl + o);
    }

    getIllness(id: string): Observable<Illness>{
      return this.http.get<Illness>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setIllness(c: Illness):Observable<Illness>{
      return this.http.post<Illness>(this.apiUrl, c);
    }

    updateIllness(c: Illness):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
