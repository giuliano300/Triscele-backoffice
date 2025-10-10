import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { ProductService } from '../../services/Product.service';
import { ProductViewModel } from '../../classess/productViewModel';
import { MatSort } from '@angular/material/sort';
import { AddMovementComponent } from '../../add-movement-dialog/add-movement-dialog.component';
import { ProductMovements } from '../../interfaces/productMovements';
import { ProductMovementsService } from '../../services/Product-movements.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule, MatTooltipModule, NgIf],
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
      @Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    orders: number = 0;
    customers: number = 0;
    productsEnd: number = 0;
    ordersByMonth: any[] = [];
    y: number = new Date().getFullYear();

    loaded: boolean = false;

   ngOnInit(): void {
    this.loadStats();
    this.findLowStock();
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
      console.log(result);
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
