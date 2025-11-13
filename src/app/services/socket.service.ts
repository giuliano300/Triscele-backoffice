import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';
import { API_URL } from '../../main';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor(private toastr: ToastrService, private zone: NgZone) {
    this.socket = io(API_URL); // backend URL
    this.listenForAbsenceRequests();
  }

  private listenForAbsenceRequests() {
    this.socket.on('newAbsence', (data: { operatorName: string }) => {
    // Recupera lo stato salvato nel localStorage
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isOperator = localStorage.getItem('isOperator') === 'true';

    // Mostra Toastr solo se è admin
    if (isAdmin && !isOperator) {
        this.zone.run(() => {  // 🔹 forza Angular a rilevare il cambiamento
        this.toastr.info(
            `${data.operatorName} ha inserito una nuova richiesta di assenza`,
            'Nuova richiesta',
            {
                timeOut: 0,       // 🔹 non chiude automaticamente
                extendedTimeOut: 0,
                closeButton: true, // 🔹 mostra il pulsante di chiusura
                tapToDismiss: false // 🔹 disabilita chiusura al click
            }
        );
        });
    }

    // 🔹 Log di debug
    console.log('Evento newAbsence ricevuto:', data, 'isAdmin:', isAdmin, 'isOperator:', isOperator);
    });
  }
}
