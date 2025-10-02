import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductMovements } from '../interfaces/productMovements';

@Injectable({
  providedIn: 'root'
})
export class ProductMovementsService {

    private apiUrl = API_URL + "ProductMovements";
    
    constructor(private http: HttpClient) {}

    getProductMovements(): Observable<ProductMovements[]>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.get<ProductMovements[]>(this.apiUrl, { headers });
    }

    getProductMovement(id: string): Observable<ProductMovements>{
      return this.http.get<ProductMovements>(this.apiUrl + "/" + id);
    }

    delete(id: string):Observable<boolean>{
      const token = localStorage.getItem('authToken'); 
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });      
      return this.http.delete<boolean>(this.apiUrl + "/" + id, { headers });
    }
  
    setProductMovements(c: ProductMovements):Observable<ProductMovements>{
      return this.http.post<ProductMovements>(this.apiUrl, c);
    }

    updateProductMovements(c: ProductMovements):Observable<boolean>{
      return this.http.put<boolean>(this.apiUrl + "/" + c._id, c);
    }

}
