import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login } from '../interfaces/Login';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

    private apiUrl = API_URL;
    
    constructor(private http: HttpClient) {}

    login(login:Login): Observable<string>{
      const urls = this.apiUrl + "auth/login";
      return this.http.post<any>(urls, login);
    }

}
