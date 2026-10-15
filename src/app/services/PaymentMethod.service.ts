import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { PaymentMethodOption } from '../interfaces/payment-method';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly apiUrl = API_URL + 'payment-methods';
  constructor(private readonly http: HttpClient) {}
  getPaymentMethods(includeDisabled = false): Observable<PaymentMethodOption[]> {
    return this.http.get<PaymentMethodOption[]>(`${this.apiUrl}?includeDisabled=${includeDisabled}`);
  }
  create(method: PaymentMethodOption): Observable<PaymentMethodOption> {
    return this.http.post<PaymentMethodOption>(this.apiUrl, method);
  }
  update(method: PaymentMethodOption): Observable<PaymentMethodOption> {
    return this.http.put<PaymentMethodOption>(`${this.apiUrl}/${method._id}`, method);
  }
}
