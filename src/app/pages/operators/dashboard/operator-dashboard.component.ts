import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { AttendanceService } from '../../../services/Attendance.service';
import { Attendance, Break } from '../../../interfaces/attendance';
import { FeatherModule } from 'angular-feather';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
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
  liveTimer: string = '00h 00m 00s';
  breakTimer: string = '00h 00m 00s';
  notes: string = '';
  entryTime: string = '';
  private timerInterval: any;
  private breakInterval: any;

  constructor(
    private attendanceService: AttendanceService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const o = JSON.parse(localStorage.getItem('operator') || '{}');
    this.operatorId = o?.sub ?? '';
    this.todayAttendance();
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
  }

  todayAttendance() {
    this.attendanceService.getTodayAttendance(this.operatorId).subscribe({
      next: (data) => {
        this.attendance = data;
        if (data?.entryTime && !data.exitTime) this.startTimer(data.entryTime);
        const activeBreak = this.getActiveBreak();
        if (activeBreak) this.startBreakTimer(activeBreak.start);
      },
      error: () => (this.attendance = undefined),
    });
  }

  confirmEntry() {
    const dto = {
      operatorId: this.operatorId,
      date: new Date(),
      entryTime: this.getTime(),
      notes: this.notes,
      breaks: []
    };
    this.attendanceService.setAttendance(dto).subscribe((a) => {
      this.attendance = a;
      this.startTimer(dto.entryTime);
    });
  }

  startBreak() {
    if (!this.attendance) return;
    const newBreak: Break = { start: this.getTime(), end: undefined };
    this.attendance.breaks.push(newBreak);

    this.attendanceService.updateAttendance(this.attendance).subscribe(() => {
      this.startBreakTimer(newBreak.start);
      clearInterval(this.timerInterval);
    });
  }

  endBreak() {
    if (!this.attendance) return;
    const activeBreak = this.getActiveBreak();
    if (!activeBreak) return;

    activeBreak.end = this.getTime();

    this.attendanceService.updateAttendance(this.attendance).subscribe(() => {
      clearInterval(this.breakInterval);
      this.startTimer(this.attendance!.entryTime);
    });
  }

  hasActiveBreak(): boolean {
    return !!this.attendance?.breaks.find(b => !b.end);
  }

  getActiveBreak(): Break | undefined {
    return this.attendance?.breaks.find(b => !b.end);
  }

  startTimer(entryTime: string) {
    const [eh, em, es] = entryTime.split(':').map(Number);
    const start = new Date();
    start.setHours(eh, em, es);

    clearInterval(this.timerInterval);

    const update = () => {
      let diff = Date.now() - start.getTime();

      if (this.attendance?.breaks.length) {
        this.attendance.breaks.forEach(b => {
          if (b.end) {
            const [sh, sm, ss] = b.start.split(':').map(Number);
            const [eh, em, es] = b.end.split(':').map(Number);
            const s = new Date(); s.setHours(sh, sm, ss);
            const e = new Date(); e.setHours(eh, em, es);
            diff -= (e.getTime() - s.getTime());
          } else {
            const [sh, sm, ss] = b.start.split(':').map(Number);
            const s = new Date(); s.setHours(sh, sm, ss);
            diff -= (Date.now() - s.getTime());
          }
        });
      }

      this.liveTimer = this.formatSeconds(Math.floor(diff / 1000));
    };

    update();
    this.timerInterval = setInterval(update, 1000);
  }

  startBreakTimer(startTime: string) {
    const [h, m, s] = startTime.split(':').map(Number);
    const start = new Date(); start.setHours(h, m, s);
    clearInterval(this.breakInterval);

    const update = () => {
      const diff = Date.now() - start.getTime();
      this.breakTimer = this.formatSeconds(Math.floor(diff / 1000));
    };

    update();
    this.breakInterval = setInterval(update, 1000);
  }

  confirmExit() {
    if (!this.attendance) return;
    this.attendance.exitTime = this.getTime();
    this.attendance.notes = this.notes;

    this.attendanceService.updateAttendance(this.attendance).subscribe(() => {
      clearInterval(this.timerInterval);
      clearInterval(this.breakInterval);
    });
  }

  private pad(n: number): string { return n < 10 ? '0' + n : n.toString(); }
  private getTime(): string {
    const d = new Date();
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}:${this.pad(d.getSeconds())}`;
  }

  private updateTime() {
    this.entryTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private formatSeconds(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}h ${m}m ${s}s`;
  }
}
