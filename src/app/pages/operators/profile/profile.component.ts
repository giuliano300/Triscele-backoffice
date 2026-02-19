import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf, NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
import { Router } from '@angular/router';
import { OperatorService } from '../../../services/Operator.service';
import { Operators } from '../../../interfaces/operators';
import { CalendarService } from '../../../services/Calendar.service';
import { MiniCalendarEvent } from '../../../interfaces/miniCalendarEvent';
import { UtilsService } from '../../../services/utils.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

interface OperatorMonth {
  operatorId: string;
  fullName: string;
  startTime?: string;
  endTime?: string;
  events: MiniCalendarEvent[];
}

interface OperatorSummary {
  operatorId: string;
  fullName: string;
  lateHours: string;
  overtimeHours: string;
  permissionHours: string;
  earlyExitHours: string;
  vacationDays: number;
  sickDays: number;
  absenceUnjustified: number;
}


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FeathericonsModule,
    CommonModule,
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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
export class ProfileComponent {
  isBrowser = false;
  operatorId = '';
  ferieRimanenti: string | null = null;
  ferie: string | undefined;
  permessiRimanenti: string | null = null;
  permessi: string | undefined;

  operator: Operators | null = null;
  operators: OperatorMonth[] = [];
  currentMonth: number;
  currentYear: number;
  holidays: string[] = [];

  summaries: OperatorSummary[] = [];
  monthDays: number[] = [];


  constructor(
    private router: Router,
    private operatorService: OperatorService,
    private calendarService: CalendarService,
    private utils: UtilsService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    const today = new Date();
    this.currentMonth = today.getMonth(); // 0-11
    this.currentYear = today.getFullYear();
  }

    async ngOnInit(): Promise<void> {
        if (!this.isBrowser) return;

        const o = JSON.parse(localStorage.getItem('operator') || '{}');
        this.operatorId = o?.sub ?? '';

        this.utils.getItalianHolidays(this.currentYear)
            .subscribe(h => this.holidays = h);

        this.operatorService.getOperator(this.operatorId).subscribe(async (data) =>{
            this.operator = data;
            this.ferieRimanenti = data?.remainingNumberOfHolidays!.toString();
            this.ferie = data?.numberOfHolidays!.toString();
            this.permessiRimanenti = data?.remainingNumberOfPermissions!.toString();
            this.permessi = data?.numberOfPermissions!.toString();

            await this.loadChartHolidays();
            await this.loadChartPermissions();
            this.generateMonthDays();
            this.loadCalendarOperator(this.operatorId);
        })

    }

    getRowClasses(day: number) {

        const events = this.getEventsForDay(this.operators[0]?.events || [], day);

        return {
            'non-working': this.isWeekendOrHoliday(day),
            'row-illness': this.hasIllness(events),
            'row-permission': this.hasPermission(events),
            'row-vacation': this.hasVacation(events),
            'row-unjustified': this.hasUnjustified(events)
        };
    }


    hasPermission(events: MiniCalendarEvent[]) {
        return events.some(e => e.tipologia === 'assenza' && e.title !== 'Ferie'&& !e.title.includes('ingiustificata'));
    }

    hasUnjustified(events: MiniCalendarEvent[]) {
        return events.some(e => e.tipologia === 'assenza' && e.title.includes('ingiustificata'));
    }

    hasVacation(events: MiniCalendarEvent[]) {
        return events.some(e => e.tipologia === 'assenza' && e.title === 'Ferie');
    }

    hasIllness(events: MiniCalendarEvent[]) {
        return events.some(e => e.tipologia === 'malattia');
    }


    isWeekendOrHoliday(day: number): boolean {

        const date = new Date(this.currentYear, this.currentMonth, day);

        // weekend
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        // festivi
        const dateStr =
            `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

        const isHoliday = this.holidays.includes(dateStr);

        return isWeekend || isHoliday;
    }

    loadCalendarOperator(operatorId: string) {
    this.calendarService
        .getMonthlyCalendarEvents(this.currentMonth + 1, this.currentYear, operatorId)
        .subscribe(res => {
            this.operators = this.groupByOperator(res.data);
            this.buildSummaries();
        });
    }

    buildSummaries() {

    this.summaries = this.operators.map(op => {

        let lateMinutes = 0;
        let overtimeMinutes = 0;
        let permissionMinutes = 0;
        let earlyExitMinutes = 0;
        let vacationDays = 0;
        let sickDays = 0;
        let absenceUnjustified = 0;

        op.events.forEach(ev => {

        if (ev.tipologia === 'malattia' && ev.startDate && ev.endDate) {
            sickDays += this.utils.countWorkingDays(
                ev.startDate,
                ev.endDate,
                this.currentMonth,
                this.currentYear,
                this.holidays
            );
        }
        
        if (ev.tipologia === 'assenza' && ev.title !== 'Ferie') {
          if (ev.startHour && ev.endHour) {
            permissionMinutes += this.utils.diffMinutes(ev.startHour, ev.endHour);
          }
        }


        if (ev.tipologia === 'assenza' && ev.title === 'Ferie' && ev.startDate && ev.endDate) {
            vacationDays += this.utils.countWorkingDays(
                ev.startDate,
                ev.endDate,
                this.currentMonth,
                this.currentYear,
                this.holidays
            );
        }

        let minLate =  ev.calculatedDelay ?? 0;

        if (ev.tipologia === 'presenza' && ev.startHour && ev.endHour) {
          if (ev.operatorStartTime) {
            lateMinutes += minLate;
          }

          if (ev.operatorEndTime && ev.endHour > ev.operatorEndTime && minLate == 0) {
            overtimeMinutes += this.utils.calculateOvertime(ev);
          }

          if (ev.operatorEndTime && ev.endHour < ev.operatorEndTime) {
            earlyExitMinutes += this.utils.diffMinutes(ev.endHour, ev.operatorEndTime);
          }
        }

        });

        return {
        operatorId: op.operatorId,
        fullName: op.fullName,
        lateHours: this.utils.formatMinutesToHours(lateMinutes),
        overtimeHours: this.utils.formatMinutesToHours(overtimeMinutes),
        permissionHours: this.utils.formatMinutesToHours(permissionMinutes),
        earlyExitHours: this.utils.formatMinutesToHours(earlyExitMinutes),
        vacationDays,
        sickDays,
        absenceUnjustified
        };

    });

    }

    private groupByOperator(events: MiniCalendarEvent[]): OperatorMonth[] {

        const map = new Map<string, OperatorMonth>();

        events.forEach(ev => {

            if (ev.tipologia === 'presenza') {
                ev.calculatedDelay = this.utils.calculateEventDelay(ev);
            }

            const key = ev.fullName;

            if (!map.has(key)) {
            map.set(key, {
                operatorId: ev.id,
                fullName: ev.fullName,
                startTime: ev.operatorStartTime,
                endTime: ev.operatorEndTime,
                events: []
            });
            }

            map.get(key)!.events.push(ev);
        });

        return Array.from(map.values());
    }

    getEventsForDay(events: MiniCalendarEvent[], day: number): MiniCalendarEvent[] {

        const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

        return events.filter(e =>
            e.date === dateStr ||
            (e.startDate && e.endDate && dateStr >= e.startDate && dateStr <= e.endDate)
        );
    }

    getPresence(events: MiniCalendarEvent[]) {
    return events.find(e => e.tipologia === 'presenza');
    }

    formatHourMinute(time?: string): string | null {
        if (!time) return null;
        const [h,m] = time.split(':');
        return `${h}:${m}`;
    }
    
    generateMonthDays() {
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        this.monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }

    previousMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }

        this.generateMonthDays();
        this.loadCalendarOperator(this.operatorId);
    }

    nextMonth() {

        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }

        this.generateMonthDays();
        this.loadCalendarOperator(this.operatorId);
    }

    get currentMonthName(): string {
        return new Date(this.currentYear, this.currentMonth)
            .toLocaleString('default', { month: 'long' });
    }

    async loadChartHolidays(): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: [this.getRemainingPermssionPercentage()],
                    chart: {
                        height: 273,
                        type: "radialBar"
                    },
                    plotOptions: {
                        radialBar: {
                            startAngle: -135,
                            endAngle: 135,
                            dataLabels: {
                                name: {
                                    offsetY: 103
                                },
                                value: {
                                    offsetY: 60,
                                    formatter: function(val:any) {
                                        return val + "%";
                                    }
                                }
                            },
                            track: {
                                background: '#EFF7FF',
                            }
                        }
                    },
                    colors: [
                        "#135ce2ff"
                    ],
                    stroke: {
                        dashArray: 4
                    },
                    labels: ["Ore di permesso rimanenti"]
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#pm_tasks_permission_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    getRemainingHolidaysPercentage(): number {
      const remaining = this.operator?.remainingNumberOfHolidays ?? 0;
      const total = this.operator?.numberOfHolidays ?? 0;

      if (total === 0) {
        return 0;
      }

      return Math.round((remaining / total) * 100);
    }
    getRemainingPermssionPercentage(): number {
      const remaining = this.operator?.remainingNumberOfPermissions ?? 0;
      const total = this.operator?.numberOfPermissions ?? 0;

      if (total === 0) {
        return 0;
      }

      return Math.round((remaining / total) * 100);
    }
    async loadChartPermissions(): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: [this.getRemainingHolidaysPercentage()],
                    chart: {
                        height: 273,
                        type: "radialBar"
                    },
                    plotOptions: {
                        radialBar: {
                            startAngle: -135,
                            endAngle: 135,
                            dataLabels: {
                                name: {
                                    offsetY: 103
                                },
                                value: {
                                    offsetY: 60,
                                    formatter: function(val:any) {
                                        return val + "%";
                                    }
                                }
                            },
                            track: {
                                background: '#EFF7FF',
                            }
                        }
                    },
                    colors: [
                        "#ff3d77ff"
                    ],
                    stroke: {
                        dashArray: 4
                    },
                    labels: ["Ferie disponibili"]
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#pm_tasks_holidays_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }
}
