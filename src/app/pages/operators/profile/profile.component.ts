import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf, NgFor } from '@angular/common';
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
    FeathericonsModule
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

  constructor(
    private router: Router,
    private operatorService: OperatorService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    const o = JSON.parse(localStorage.getItem('operator') || '{}');
    this.operatorId = o?.sub ?? '';

    this.operatorService.getOperator(this.operatorId).subscribe(async (data) =>{
      this.operator = data;
      this.ferieRimanenti = data?.remainingNumberOfHolidays!.toString();
      this.ferie = data?.numberOfHolidays!.toString();
      this.permessiRimanenti = data?.remainingNumberOfPermissions!.toString();
      this.permessi = data?.numberOfPermissions!.toString();

      await this.loadChartHolidays();
      await this.loadChartPermissions();
  })

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
