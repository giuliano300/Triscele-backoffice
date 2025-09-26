import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categories } from '../interfaces/categories';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

    private apiUrl = API_URL + "Categories";
    
    constructor(private http: HttpClient) {}

    getCategories(): Observable<Categories[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<Categories[]>(this.apiUrl, { headers });
    }

    getCategory(id: string): Observable<Categories>{
      return this.http.get<Categories>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setCategory(c: Categories):Observable<Categories>{
      return this.http.post<Categories>(this.apiUrl, c);
    }

    updateCategory(c: Categories):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
