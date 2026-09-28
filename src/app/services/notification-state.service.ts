import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PermissionHoliday } from '../interfaces/permissionHoliday';
import { absenceType } from '../enum/enum';
import { NotificationsService } from './Notifications.service';

@Injectable({ providedIn: 'root' })
export class NotificationStateService {
  private readonly absenceCounter = new BehaviorSubject<number>(0);
  readonly absenceCounter$ = this.absenceCounter.asObservable();

  constructor(
    private readonly toastr: ToastrService,
    private readonly notificationService: NotificationsService,
  ) {}

  setInitialCounter(value: number): void {
    this.absenceCounter.next(value);
  }

  buildMessage(permissionHoliday: PermissionHoliday): string {
    const typeLabel = permissionHoliday.type === absenceType.ferie ? 'ferie' : 'permesso';
    const details = permissionHoliday.type === absenceType.ferie
      ? `dal ${new Date(permissionHoliday.startDate).toLocaleDateString('it-IT')} al ${new Date(permissionHoliday.endDate).toLocaleDateString('it-IT')}`
      : `del ${new Date(permissionHoliday.startDate).toLocaleDateString('it-IT')} dalle ore ${permissionHoliday.startHour} alle ore ${permissionHoliday.endHour}`;

    return permissionHoliday.accepted
      ? `L'amministrazione ha accettato la tua richiesta di ${typeLabel} ${details}`
      : `L'amministrazione ha rifiutato la tua richiesta di ${typeLabel} ${details}`;
  }

  notify(message: string, title: string, type: 'info' | 'error', notificationId?: string): void {
    const options = {
      timeOut: 0,
      extendedTimeOut: 0,
      closeButton: true,
      tapToDismiss: false,
    };
    const toast = type === 'info'
      ? this.toastr.info(message, title, options)
      : this.toastr.error(message, title, options);

    toast.onHidden.subscribe(() => {
      if (notificationId) {
        this.notificationService.markAsRead(notificationId).subscribe();
      }
    });
  }
}
