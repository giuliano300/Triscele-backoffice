import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission } from '../interfaces/permissions';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

    private apiUrl = API_URL + "Permissions";
    
    constructor(private http: HttpClient) {}

    getPermissions(): Observable<Permission[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Permission[]>(this.apiUrl, { headers });
    }

    getPermission(id: string): Observable<Permission>{
      return this.http.get<Permission>(this.apiUrl + "/" + id);
    }

}
