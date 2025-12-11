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
  pauseTimer: string = '';
  private pauseInterval: any;

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

  startLunch() {
    if (!this.attendance) return;

    const lunchStart = this.getTime();
    this.attendance.lunchStart = lunchStart;

    this.attendanceService.updateAttendance(this.attendance).subscribe(a => {
      //this.attendance = a;
      this.startPauseTimer(lunchStart);
      clearInterval(this.timerInterval); // ferma timer lavoro
    });
  }

  endLunch() {
    if (!this.attendance) return;

    const lunchEnd = this.getTime();
    this.attendance.lunchEnd = lunchEnd;

    this.attendanceService.updateAttendance(this.attendance).subscribe(a => {
      //this.attendance = a;

      clearInterval(this.pauseInterval);
      this.startTimer(this.attendance!.entryTime); // riparte timer lavoro
    });
  }

  startPauseTimer(startTime: string) {
    const [h, m, s] = startTime.split(':').map(Number);

    const start = new Date();
    start.setHours(h, m, s);

    clearInterval(this.pauseInterval);

    const update = () => {
      const now = Date.now();
      const diff = now - start.getTime();

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      this.pauseTimer = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    };

    update();
    this.pauseInterval = setInterval(update, 1000);
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
    const [eh, em, es] = entryTime.split(':').map(Number);
    const start = new Date();
    start.setHours(eh, em, es);

    clearInterval(this.timerInterval);

    const update = () => {
      const now = Date.now();
      let diff = now - start.getTime();

      // ⭐ Sottrai la pausa se presente
      if (this.attendance?.lunchStart) {
        const [lh, lm, ls] = this.attendance.lunchStart.split(':').map(Number);
        const lunchStartDate = new Date();
        lunchStartDate.setHours(lh, lm, ls);

        let lunchEndDate: Date;
        if (this.attendance.lunchEnd) {
          const [lhEnd, lmEnd, lsEnd] = this.attendance.lunchEnd.split(':').map(Number);
          lunchEndDate = new Date();
          lunchEndDate.setHours(lhEnd, lmEnd, lsEnd);
        } else {
          // Pausa in corso → fino ad ora
          lunchEndDate = new Date();
        }

        const lunchDiff = lunchEndDate.getTime() - lunchStartDate.getTime();
        diff -= lunchDiff;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      this.liveTimer = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    };

    update();
    this.timerInterval = setInterval(update, 1000);
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

  calculateBreakDuration(start: string, end: string): string {
    const s = this.toSeconds(start);
    const e = this.toSeconds(end);
    const diff = e - s;
    return this.formatSeconds(diff);
  }

  calculateWorkedTime(
    entry: string,
    exit: string,
    lunchStart?: string,
    lunchEnd?: string
  ): string {

  const start = this.toSeconds(entry);
    const end = this.toSeconds(exit);

    let workedSeconds = end - start;

    if (lunchStart && lunchEnd) {
      const breakStart = this.toSeconds(lunchStart);
      const breakEnd = this.toSeconds(lunchEnd);
      workedSeconds -= (breakEnd - breakStart);
    }

    return this.formatSeconds(workedSeconds);
  }

  private toMinutes(time: string): number {
    const [h, m, s] = time.split(':').map(Number);
    return h * 60 + m + (s ? s / 60 : 0);
  }

  private formatMinutes(total: number): string {
    const hours = Math.floor(total / 60);
    const minutes = Math.floor(total % 60);
    return `${hours}h ${minutes}m`;
  }

  private toSeconds(time: string): number {
    const [h, m, s] = time.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  private formatSeconds(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return `${h}h ${m}m ${s}s`;
  }
}
