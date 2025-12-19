import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AllowedIp } from '../interfaces/allowed-ip';
import { API_URL } from '../../main';
import { Holiday } from '../interfaces/holidays';

@Injectable({ providedIn: 'root' })
export class HolidayService {

  private readonly apiUrl = API_URL + 'holidays';

  constructor(private http: HttpClient) {}

  getAll(year: number): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(this.apiUrl + "?year=" + year);
  }

  getAllStringFormat(year: number): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + "?year=" + year);
  }

  getCustom(): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(this.apiUrl + "/custom");
  }

  create(data: Holiday): Observable<Holiday> {
    return this.http.post<Holiday>(this.apiUrl, data);
  }

  update(data: Holiday): Observable<Holiday> {
    return this.http.put<Holiday>(`${this.apiUrl}/${data._id}`, data);
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
