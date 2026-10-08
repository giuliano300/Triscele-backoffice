import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { ProductService } from '../../services/Product.service';
import { ProductViewModel } from '../../classess/productViewModel';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AddMovementComponent } from '../../add-movement-dialog/add-movement-dialog.component';
import { ProductMovements } from '../../interfaces/productMovements';
import { ProductMovementsService } from '../../services/Product-movements.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PermissionHolidayService } from '../../services/PermissionHoliday.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { NotificationsService } from '../../services/Notifications.service';
import { Notifications } from '../../interfaces/notifications';

interface DashboardQuote {
  id: string;
  quoteNumber?: number;
  customer: string;
  date: string;
  totalPrice?: number;
  status: null;
}

interface DashboardApprovedOrder {
  id: string;
  orderNumber?: number;
  customer: string;
  approvedAt: string;
  totalPrice?: number;
  agent: string;
  status?: { name: string; color: string };
}

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule, 
    MatButtonModule, 
    MatMenuModule, 
    MatPaginatorModule, 
    MatTableModule, 
    MatCheckboxModule, 
    MatTooltipModule, 
    CommonModule,
    MatSortModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

    private isBrowser: boolean | undefined;
    products: ProductViewModel[] = [];

    dataSource = new MatTableDataSource<ProductViewModel>(this.products);

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    displayedColumns: string[] = [
        'name',
        'supplier',
        'category',
        'theshold',
        'stock'
    ];
 
   constructor(
      private router: Router,
      private dialog: MatDialog,
      private statsService: StatsService,
      private productService: ProductService,
      private productMovementsService: ProductMovementsService,
      private permissionHolidayService: PermissionHolidayService,
      private notificationStateService: NotificationStateService,
      private notificationsService: NotificationsService,
      @Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    orders: number = 0;
    customers: number = 0;
    productsEnd: number = 0;
    ordersByMonth: any[] = [];
    y: number = new Date().getFullYear();
    absence: number = 0;

    loaded: boolean = false;
    notifications: Notifications[] = [];
    openQuotes: DashboardQuote[] = [];
    recentApprovedOrders: DashboardApprovedOrder[] = [];
    openQuotesLoading = true;
    approvedOrdersLoading = true;
    openQuotesError = false;
    approvedOrdersError = false;


   ngOnInit(): void {
    this.loadStats();
    this.countPending();
    this.findLowStock();
    this.loadOpenQuotes();
    this.loadRecentApprovedOrders();
    this.notificationStateService.absenceCounter$.subscribe(value => {
        this.absence = value;
    });
    this.notificationsService.getAdminNotRead().subscribe((data: Notifications[]) => {
        this.notifications = data;
        //console.log(this.notifications);
        this.notificationStateService.setInitialCounter(data.length);
      
        data.forEach(notification => {
          let type:'info' | 'error' = 'info';
          let message = '';
          let title = '';
          if(notification.event == "sendNewQuotation")
          {
              message = `Il cliente ${notification.payload.p} ha inserito un nuovo peventivo`;
              title = 'Nuovo preventivo';
          }
          if(notification.event == "newAbsence")
          {
              message = `${notification.payload.operatorName} ha inserito una nuova richiesta di assenza`;
              title = 'Nuova richiesta';
          }
          
          if(notification.event == "confirmAbsence")
          {
              message = this.notificationStateService.buildMessage(notification.payload.p);
              title = notification.payload.p.accepted ? 'Richiesta accettata' : 'Richiesta rifiutata';
              type = notification.payload.p.accepted ? 'info' : 'error';
          }
          
          this.notificationStateService.notify(message, title, type, notification._id);
        });
      });
   }

   loadOpenQuotes(): void {
    this.openQuotesLoading = true;
    this.openQuotesError = false;
    this.statsService.getOpenQuotes(5).subscribe({
      next: data => {
        this.openQuotes = data;
        this.openQuotesLoading = false;
      },
      error: () => {
        this.openQuotes = [];
        this.openQuotesError = true;
        this.openQuotesLoading = false;
      }
    });
   }

   loadRecentApprovedOrders(): void {
    this.approvedOrdersLoading = true;
    this.approvedOrdersError = false;
    this.statsService.getRecentApprovedOrders(5).subscribe({
      next: data => {
        this.recentApprovedOrders = data;
        this.approvedOrdersLoading = false;
      },
      error: () => {
        this.recentApprovedOrders = [];
        this.approvedOrdersError = true;
        this.approvedOrdersLoading = false;
      }
    });
   }

   formatDocumentNumber(value?: number): string {
    return value !== undefined ? String(value).padStart(3, '0') : '-';
   }

   openQuote(id: string): void {
    this.router.navigate(['/order/add', id], { queryParams: { state: 11 } });
   }

   openOrder(id: string): void {
    this.router.navigate(['/order/add', id]);
   }

   showAllOpenQuotes(): void {
    this.router.navigate(['/quotations']);
   }

   showAllApprovedOrders(): void {
    this.router.navigate(['/orders']);
   }

   countPending(){
    this.permissionHolidayService.countPending().subscribe((d: number) =>{
      this.absence = d;
    })
   }

   findLowStock(){
    this.productService.findLowStock().subscribe((data) => {
        if (!data || data.length === 0) {
            this.dataSource.data = [];
           this.productsEnd = 0;      
        } 
        else 
        {
          this.products = data;
          this.dataSource = new MatTableDataSource<ProductViewModel>(this.products);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.productsEnd = data.length;
        }    
    });
   }

   loadStats() {
    this.statsService.getStats(this.y).subscribe((data) => {
      this.orders = data.totalOrders.toLocaleString('it-IT');
      this.customers = data.totalCustomers.toLocaleString('it-IT');
      this.ordersByMonth = data.ordersByMonth;
      this.loaded = true;
      this.loadChart();
    });
   }
   
  async loadChart(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      // Import dinamico ApexCharts
      const ApexCharts = (await import('apexcharts')).default;

      const monthsData = this.ordersByMonth || [];

      const ordersArray = Array(12).fill(0);
      monthsData.forEach((m: any) => {
        if (m.month >= 1 && m.month <= 12) {
            ordersArray[m.month - 1] = m.orders;
        }
      });
      const options: ApexCharts.ApexOptions = {
        series: [
          {
            name: 'Ordini',
            data: ordersArray,
          },
        ],
        chart: {
          height: 360,
          type: 'area',
          toolbar: { show: false },
          fontFamily: 'inherit',
        },
        dataLabels: { enabled: false },
        fill: {
          type: 'gradient',
          gradient: {
            opacityFrom: 0.45,
            opacityTo: 0.05,
          },
        },
        grid: {
          borderColor: '#edeff5',
          strokeDashArray: 3,
          xaxis: { lines: { show: true } },
          yaxis: { lines: { show: true } },
        },
        stroke: {
          width: 3,
          curve: 'smooth',
        },
        colors: ['#3761EE'],
        xaxis: {
          categories: [
            'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
            'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic',
          ],
          axisTicks: { show: false },
          axisBorder: { show: false },
          labels: {
            style: {
              colors: '#262626',
              fontSize: '13px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#a9a9c8',
              fontSize: '13px',
            },
          },
        },
        legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'center',
          fontSize: '13px',
          labels: { colors: '#77838f' },
          itemMargin: { horizontal: 15 },
          markers: { offsetY: -1 },
        },
      };

      // 🔁 Rimuovi grafico precedente (utile nei refresh)
      const chartContainer = document.querySelector('#crm_balance_overview_chart');
      if (chartContainer && chartContainer.innerHTML.trim() !== '') {
        chartContainer.innerHTML = '';
      }

      // 🎨 Crea e renderizza grafico
      const chart = new ApexCharts(chartContainer, options);
      await chart.render();
    } catch (error) {
      console.error('Errore nel caricamento del grafico ApexCharts:', error);
    }
  
  }
  
  renderChart() {
    const ctx = document.getElementById('ordersChart') as HTMLCanvasElement;
    if (!ctx) return;

    const months = this.ordersByMonth.map((m) => `Mese ${m.month}`);
    const orders = this.ordersByMonth.map((m) => m.orders);

    new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Numero ordini',
            data: orders,
          },
        ],
      },
    });
  }

  addMovements(item: ProductViewModel){
    const dialogRef = this.dialog.open(AddMovementComponent, {
      data: item,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      //console.log(result);
      if (result) {
        this.productMovementsService.setProductMovements(result)
          .subscribe((data: ProductMovements) => {
            if (data) {
              this.findLowStock();
            }
          });
      } else {
        console.log("Close");
      }
    });
  }

  isTruncated(element: HTMLElement): boolean {
    return element.scrollWidth > element.clientWidth;
  }

 }
