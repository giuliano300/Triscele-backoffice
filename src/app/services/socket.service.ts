import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';
import { API_URL } from '../../main';
import { PermissionHoliday } from '../interfaces/permissionHoliday';
import { absenceType } from '../enum/enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  
  private _absenceCounter = new BehaviorSubject<number>(0);
  public absenceCounter$ = this._absenceCounter.asObservable();

  constructor(private toastr: ToastrService, private zone: NgZone) {
    this.socket = io(API_URL);
    this.listenForAbsenceRequests();
  }

  public setInitialCounter(value: number) {
    this._absenceCounter.next(value);
  }

  // Metodo per incrementare contatore
  private incrementCounter() {
    const current = this._absenceCounter.value;
    this._absenceCounter.next(current + 1);
  }

  // -------------------------------------------------------------
  // 🔹 UTILITY: ruolo utente
  // -------------------------------------------------------------
  private isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  private isOperator(): boolean {
    return localStorage.getItem('isOperator') === 'true';
  }

  // -------------------------------------------------------------
  // 🔹 UTILITY: formattazione testo
  // -------------------------------------------------------------
  private getAbsenceDetails(p: PermissionHoliday): string {
    if (p.type === absenceType.ferie) {
      const from = new Date(p.startDate).toLocaleDateString('it-IT');
      const to = new Date(p.endDate).toLocaleDateString('it-IT');
      return `dal ${from} al ${to}`;
    } else {
      const date = new Date(p.startDate).toLocaleDateString('it-IT');
      return `del ${date} dalle ore ${p.startHour} alle ore ${p.endHour}`;
    }
  }

  private buildMessage(p: PermissionHoliday): string {
    const typeLabel = p.type === absenceType.ferie ? 'ferie' : 'permesso';
    const details = this.getAbsenceDetails(p);

    return p.accepted
      ? `L'amministrazione ha accettato la tua richiesta di ${typeLabel} ${details}`
      : `L'amministrazione ha rifiutato la tua richiesta di ${typeLabel} ${details}`;
  }

  // -------------------------------------------------------------
  // 🔹 UTILITY: toastr configurato
  // -------------------------------------------------------------
  private notify(message: string, title: string, type: 'info' | 'error') {
    const options = {
      timeOut: 0,
      extendedTimeOut: 0,
      closeButton: true,
      tapToDismiss: false
    };

    type === 'info'
      ? this.toastr.info(message, title, options)
      : this.toastr.error(message, title, options);
  }

  // -------------------------------------------------------------
  // 🔹 LISTENER SOCKET
  // -------------------------------------------------------------
  private listenForAbsenceRequests() {

    // 🚨 NUOVO PREVENTIVO → notifica SOLO admin
    this.socket.on('sendNewQuotation', (data: { p: string }) => {
      if (this.isAdmin() && !this.isOperator()) {
        this.zone.run(() => {
          
          this.incrementCounter();

          this.notify(
            `Il cliente ${data.p} ha inserito un nuovo peventivo`,
            'Nuovo preventivo',
            'info'
          );
        });
      }
    });

    // 🚨 NUOVA RICHIESTA → notifica SOLO admin
    this.socket.on('newAbsence', (data: { operatorName: string }) => {
      if (this.isAdmin() && !this.isOperator()) {
        this.zone.run(() => {
          
          this.incrementCounter();

          this.notify(
            `${data.operatorName} ha inserito una nuova richiesta di assenza`,
            'Nuova richiesta',
            'info'
          );
        });
      }
    });

    // 🚨 RICHIESTA CONFERMATA O RIFIUTATA → notifica SOLO operatori
    this.socket.on('confirmAbsence', (data: { p: PermissionHoliday }) => {
      if (this.isOperator() && !this.isAdmin()) {
        const o = JSON.parse(localStorage.getItem('operator') || '{}');
        const operatorId = o.sub;  
        if(operatorId === data.p.operatorId){
          this.zone.run(() => {
            const message = this.buildMessage(data.p);
            const title = data.p.accepted ? 'Richiesta accettata' : 'Richiesta rifiutata';

            this.notify(message, title, data.p.accepted ? 'info' : 'error');
          });
        }
      }
    });
  }
}
