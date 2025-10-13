import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderProducts } from '../interfaces/orderProducts';

@Injectable({
  providedIn: 'root'
})
export class OrderProductService {
  private apiUrl = '/api/order-products'; // 🔹 aggiorna con la tua base API

  constructor(private http: HttpClient) {}

  // Recupera tutti
  getAll(): Observable<OrderProducts[]> {
    return this.http.get<OrderProducts[]>(this.apiUrl);
  }

  // Recupera uno per ID
  getById(id: string): Observable<OrderProducts> {
    return this.http.get<OrderProducts>(`${this.apiUrl}/${id}`);
  }

  // Crea un nuovo prodotto ordine
  create(orderProduct: OrderProducts): Observable<OrderProducts> {
    return this.http.post<OrderProducts>(this.apiUrl, orderProduct);
  }

  // Aggiorna un prodotto ordine
  update(id: string, orderProduct: OrderProducts): Observable<OrderProducts> {
    return this.http.put<OrderProducts>(`${this.apiUrl}/${id}`, orderProduct);
  }

  // Elimina un prodotto ordine
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
