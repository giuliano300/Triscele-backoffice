import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { AttendanceService } from '../../../services/Attendance.service';
import { Attendance } from '../../../interfaces/attendance';
import { FeatherModule } from "angular-feather";
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FeatherModule,
    FeathericonsModule
  ],
  templateUrl: './operator-dashboard.component.html',
  styleUrls: ['./operator-dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class OperatorDashboardComponent {
  isBrowser = false;
  operatorId = '';
  attendance?: Attendance;
  liveTimer: string = '';
  notes: string = '';
  entryTime: string = '';
  private timerInterval: any;

  constructor(
    private attendanceService: AttendanceService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const o = JSON.parse(localStorage.getItem('operator') || '{}');
      this.operatorId = o?.sub ?? '';
      this.todayAttendance();
      this.updateTime();
      setInterval(() => this.updateTime(), 60000);
    }
  }

  // ✅ Recupera la presenza di oggi
  todayAttendance() {
    this.attendanceService.getTodayAttendance(this.operatorId).subscribe({
      next: (data) => {
        this.attendance = data;
        if (data?.entryTime && !data.exitTime) {
          this.startTimer(data.entryTime);
        }
      },
      error: () => (this.attendance = undefined),
    });
  }

  // ✅ Conferma l'ingresso
  confirmEntry() {
    const dto = {
      operatorId: this.operatorId,
      date: new Date(),
      entryTime: this.getTime(),
      notes: this.notes,
    };

    this.attendanceService.setAttendance(dto).subscribe((a) => {
      this.attendance = a;
      this.startTimer(dto.entryTime);
    });
  }

  // ✅ Conferma l'uscita
  confirmExit() {
    if (!this.attendance) return;
    const exitTime = this.getTime();
    this.attendance.exitTime = exitTime;
    this.attendance.notes = this.notes;

    this.attendanceService.updateAttendance(this.attendance).subscribe((a) => {
      clearInterval(this.timerInterval);
      //this.attendance = a;
    });
  }

  // ✅ Timer live
  startTimer(entryTime: string) {
    const [h, m, s] = entryTime.split(':').map(Number);

    const start = new Date();
    start.setHours(h, m, s);

    clearInterval(this.timerInterval);

    const update = () => {
      const now = Date.now();
      const diff = now - start.getTime();

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      this.liveTimer = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    };

    // Aggiorna subito all'avvio
    update();

    // Aggiorna ogni secondo
    this.timerInterval = setInterval(update, 1000);
  }

  calculateWorkedTime(entry: string, exit: string): string {
    const [eh, em, es] = entry.split(':').map(Number);
    const [xh, xm, xs] = exit.split(':').map(Number);
    const start = new Date();
    const end = new Date();
    start.setHours(eh, em, es, 0);
    end.setHours(xh, xm, xs, 0);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  private getTime(): string {
    const d = new Date();
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}:${this.pad(d.getSeconds())}`;
  }

  updateTime() {
    this.entryTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
