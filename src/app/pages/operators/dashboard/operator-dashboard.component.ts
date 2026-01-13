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
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
import { AuthService } from '../../../services/auth.service';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UtilsService } from '../../../services/utils.service';
import { MiniCalendarEvent } from '../../../interfaces/miniCalendarEvent';
import { Operators } from '../../../interfaces/operators';
import { OperatorService } from '../../../services/Operator.service';
import { formatTime } from '../../../../main';

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

  // TIMER LAVORO
  liveTimer: string = '00h 00m 00s';

  // TIMER PAUSA
  breakElapsed: string = '00:00:00';     
  breakRemaining: string = '01:30:00';   
  breakExceeded: boolean = false;

  notes: string = '';
  entryTime: string = '';
  private timerInterval: any;
  private breakInterval: any;
  private updateTimeInterval: any;
  private breakStartTime!: Date;
  private readonly MAX_BREAK_SECONDS = 90 * 60; // 1h30 in secondi

  isLate: boolean = false;
  advance: boolean = false;
  minLate: number = 0;
  miniCalendarEvent: MiniCalendarEvent | undefined = undefined;
  operator: Operators | undefined = undefined;

  private pingSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private operatorService: OperatorService,
    private utils: UtilsService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const o = JSON.parse(localStorage.getItem('operator') || '{}');
    this.operatorId = o?.sub ?? '';
    this.operatorService.getOperator(this.operatorId).subscribe((data) => {
      this.operator = data;
      this.todayAttendance();
    });

    this.updateTime();
    this.updateTimeInterval = setInterval(() => this.updateTime(), 60000);

    const isOperator = localStorage.getItem('isOperator') === 'true';
    if (isOperator && this.operatorId) {
      this.authService.getPublicIp().subscribe((myIp) => {
        const ip = myIp.ip;
        this.authService.ping(this.operatorId, ip).subscribe((data) => {
          if (!data) this.router.navigate(['/dashboard-not-visible']);
        });
        this.pingSubscription = interval(5000).subscribe(() => {
          this.authService.ping(this.operatorId, ip).subscribe((data) => {
            if (!data) this.router.navigate(['/dashboard-not-visible']);
          });
        });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.breakInterval) clearInterval(this.breakInterval);
    if (this.updateTimeInterval) clearInterval(this.updateTimeInterval);
    if (this.pingSubscription) this.pingSubscription.unsubscribe();
  }

  // -------------------
  // TIMER LAVORO
  // -------------------
  startTimer(entryTime: string) {
    const [eh, em, es] = entryTime.split(':').map(Number);
    const start = new Date();
    start.setHours(eh, em, es, 0);

    clearInterval(this.timerInterval);

    const update = () => {
      let diff = Date.now() - start.getTime();

      if (this.attendance?.breaks?.length) {
        this.attendance.breaks.forEach(b => {
          const s = this.toDate(b.start);
          const e = b.end ? this.toDate(b.end) : new Date();
          diff -= e.getTime() - s.getTime();
        });
      }

      this.liveTimer = this.formatSeconds(Math.floor(diff / 1000));
    };

    update();
    this.timerInterval = setInterval(update, 1000);
  }

  getBreakProgress(): number {
    if (!this.attendance) return 0;

    let usedSeconds = 0;
    for (const b of this.attendance.breaks) {
      const start = this.toDate(b.start).getTime();
      const end = b.end ? this.toDate(b.end).getTime() : Date.now();
      usedSeconds += Math.floor((end - start) / 1000);
    }

    let progress = (usedSeconds / this.MAX_BREAK_SECONDS) * 100;
    if (progress > 100) progress = 100;
    return progress;
  }


  // -------------------
  // PAUSE
  // -------------------
  startBreak() {
    if (!this.attendance) return;

    const nowStr = this.getTime();
    this.attendance.breaks.push({ start: nowStr, end: undefined });
    this.attendanceService.updateAttendance(this.attendance).subscribe();

    // Calcola quante pause sono già state utilizzate
    let usedSeconds = 0;
    for (const b of this.attendance.breaks) {
      if (b.end) {
        const start = this.toDate(b.start).getTime();
        const end = this.toDate(b.end).getTime();
        usedSeconds += Math.floor((end - start) / 1000);
      }
    }

    // Il countdown può partire negativo se abbiamo già superato il limite
    let countdownSeconds = this.MAX_BREAK_SECONDS - usedSeconds;

    // Imposta il timer della pausa
    this.breakStartTime = this.toDate(nowStr);
    this.breakExceeded = countdownSeconds < 0;

    clearInterval(this.breakInterval);

    this.breakInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - this.breakStartTime.getTime()) / 1000);

      // Aggiorna durata pausa in corso
      this.breakElapsed = formatTime(elapsedSeconds);

      // Aggiorna countdown considerando quanto già utilizzato
      const remaining = countdownSeconds - elapsedSeconds;
      if (remaining >= 0) {
        this.breakRemaining = formatTime(remaining);
        this.breakExceeded = false;
      } else {
        this.breakRemaining = '-' + formatTime(Math.abs(remaining));
        this.breakExceeded = true;
      }

    }, 1000);

    // Ferma il timer lavoro mentre siamo in pausa
    clearInterval(this.timerInterval);
  }

  endBreak() {
    if (!this.attendance) return;
    const activeBreak = this.attendance.breaks.find(b => !b.end);
    if (!activeBreak) return;

    activeBreak.end = this.getTime();

    this.attendanceService.updateAttendance(this.attendance).subscribe(() => {
      clearInterval(this.breakInterval);
      this.startTimer(this.attendance!.entryTime);
      this.calculateDelay(this.attendance!);
    });
  }

  hasActiveBreak(): boolean {
    return !!this.attendance?.breaks.find(b => !b.end);
  }

  getActiveBreak(): Break | undefined {
    return this.attendance?.breaks.find(b => !b.end);
  }

  getRemainingDailyBreak(): string {
    if (!this.attendance?.breaks?.length) return formatTime(this.MAX_BREAK_SECONDS);

    let usedSeconds = 0;
    for (const b of this.attendance.breaks) {
      if (!b.start || !b.end) continue;
      usedSeconds += Math.floor((this.toDate(b.end).getTime() - this.toDate(b.start).getTime()) / 1000);
    }

    const remaining = this.MAX_BREAK_SECONDS - usedSeconds;
    if(remaining < 0)
      this.breakExceeded = true;
    return remaining >= 0 ? formatTime(remaining) : '-' + formatTime(Math.abs(remaining));
  }

  todayAttendance() {
    this.attendanceService.getTodayAttendance(this.operatorId).subscribe({
      next: (data) => {
        this.attendance = data;
        if (data?.entryTime && !data.exitTime) this.startTimer(data.entryTime);
        this.calculateDelay(this.attendance);
        //this.getRemainingDailyBreak();
      },
      error: () => (this.attendance = undefined),
    });
  }

  calculateDelay(attendance: Attendance) {
    this.miniCalendarEvent = {
      ...attendance,
      fullName: this.operator?.name! + " " + this.operator?.lastName!,
      id: attendance._id?.toString()!,
      operatorEndTime: this.operator?.endTime!,
      operatorStartTime: this.operator?.startTime!,
      tipologia: 'presenza',
      title: 'Presenza odierna',
      date: attendance.date?.toString().split('T')[0],
      startHour: attendance.entryTime,
      endHour: attendance.exitTime
    };
    this.minLate = this.utils.calculateEventDelay(this.miniCalendarEvent, 90, true);
    this.isLate = this.minLate > 0;
    this.advance = this.minLate < 0;
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

  confirmExit() {
    if (!this.attendance) return;
    this.attendance.exitTime = this.getTime();
    this.attendance.notes = this.notes;

    this.attendanceService.updateAttendance(this.attendance).subscribe(() => {
      clearInterval(this.timerInterval);
      clearInterval(this.breakInterval);
    });
  }

  public calculateTotalBreakDuration(): string {
    if (!this.attendance?.breaks?.length) return '0h 0m 0s';

    let totalSeconds = 0;
    this.attendance.breaks.forEach(b => {
      const start = this.toDate(b.start).getTime();
      const end = b.end ? this.toDate(b.end).getTime() : Date.now();
      totalSeconds += Math.floor((end - start) / 1000);
    });

    return this.formatSeconds(totalSeconds);
  }

  public calculateWorkedTime(): string {
    if (!this.attendance?.entryTime) return '0h 0m 0s';

    const entry = this.toDate(this.attendance.entryTime).getTime();
    const now = this.attendance.exitTime ? this.toDate(this.attendance.exitTime).getTime() : Date.now();
    let workedSeconds = Math.floor((now - entry) / 1000);

    if (this.attendance.breaks?.length) {
      let totalBreakSeconds = 0;

      for (const b of this.attendance.breaks) {
        const start = this.toDate(b.start).getTime();
        let end: number;

        if (b.end) {
          end = this.toDate(b.end).getTime();
        } else {
          // pausa in corso: considera solo fino al limite residuo giornaliero
          const elapsed = Math.floor((Date.now() - start) / 1000);
          const usedBefore = this.attendance.breaks
            .filter(x => x.end && x !== b)
            .reduce((sum, x) => sum + Math.floor((this.toDate(x.end!).getTime() - this.toDate(x.start).getTime()) / 1000), 0);

          const remainingLimit = this.MAX_BREAK_SECONDS - usedBefore;
          end = start + Math.min(elapsed, remainingLimit);
        }

        totalBreakSeconds += Math.floor((end - start) / 1000);
      }

      workedSeconds -= totalBreakSeconds;
    }

    if (workedSeconds < 0) workedSeconds = 0;

    return this.formatSeconds(workedSeconds);
  }

  // --- HELPERS ---
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

  private toDate(timeStr: string): Date {
    const [h, m, s] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, s, 0);
    return d;
  }
}
