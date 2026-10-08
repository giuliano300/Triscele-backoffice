import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/Customer.service';
import { MatDialog } from '@angular/material/dialog';
import { Customers } from '../../interfaces/customers';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FeathericonsModule } from "../../icons/feathericons/feathericons.module";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { UtilsService } from '../../services/utils.service';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBar } from '@angular/material/progress-bar';
import { getItalianPaginatorIntl } from '../../../../src/paginator-it';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, finalize, forkJoin, of } from 'rxjs';

const CUSTOMERS_STATE_KEY = 'triscele:backoffice:customers:list-state:v1';

interface CustomersState {
  filters: {
    name?: string | null;
    province?: string | null;
  };
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-customers',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
    FeathericonsModule,
    MatFormField,
    MatLabel,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelect,
    MatSelectModule,
    MatTooltip,
    MatTooltipModule,
    MatProgressBar
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useValue: getItalianPaginatorIntl()
    }
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit, AfterViewInit {

  customers: Customers[] = [];

  province: string[] = [];

  displayedColumns: string[] = ['select', 'businessName', 'vatNumber', 'email', 'mobile', 'province', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Customers>(this.customers);

  selection = new SelectionModel<Customers>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  form!: FormGroup;
  
  firstLoading: boolean = true;

  private restoredPageIndex = 0;
  private restoredPageSize = 20;

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private customerService: CustomerService,
      private dialog: MatDialog,
      private utilsService: UtilsService
  ) {}

   ngOnInit(): void {
     this.form = this.fb.group({
      name: [],
      province: []
     });

     const savedState = this.getSavedState();
     if (savedState) {
       this.form.patchValue(savedState.filters);
       this.restoredPageIndex = savedState.pageIndex;
       this.restoredPageSize = savedState.pageSize;
     }

     const { name, province } = this.form.value;
     this.getCustomers(name, province);
     this.province = [
        'non definita',
        ...this.utilsService.getProvinceItaliane()
      ];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.paginator.pageSize = this.restoredPageSize;
    this.paginator.pageIndex = this.restoredPageIndex;
    this.paginator.page.subscribe(() => this.saveState());
  }

  getCustomers(name?: string, province?: string){
    this.firstLoading = true;
    let query = '';

    if (name || province) {
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      if (province) params.append('province', province);
      query = `?${params.toString()}`;
    }
    this.customerService.getCustomers(query)
    .pipe(finalize(() => this.firstLoading = false))
    .subscribe((data: Customers[]) => {
      this.customers = (data ?? []).map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
      }));
      this.dataSource.data = this.customers;
      this.selection.clear();
      this.restorePaginatorPosition();
    });
  }

  onSubmit(){
    const { name, province } = this.form.value;
    this.restoredPageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.saveState();
    this.getCustomers(name, province);
  }

  remove(){
    this.firstLoading = true;
    this.form.patchValue({
      name: [],
      province: []
    });
    this.restoredPageIndex = 0;
    this.restoredPageSize = this.paginator?.pageSize ?? 20;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    sessionStorage.removeItem(CUSTOMERS_STATE_KEY);
    this.getCustomers();
  }

  DeleteItem(item:Customers){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.customerService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.refreshCurrentList();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  deleteSelected(): void {
    const selectedCustomers = [...this.selection.selected];
    if (selectedCustomers.length === 0) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'CONFERMA ELIMINAZIONE MULTIPLA',
        description: `Sei sicuro di voler eliminare i ${selectedCustomers.length} clienti selezionati?`,
        confirm: 'Cancella selezionati'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.firstLoading = true;
      forkJoin(
        selectedCustomers.map(customer =>
          this.customerService.delete(customer._id).pipe(
            catchError(() => of(false))
          )
        )
      ).subscribe(() => {
        this.selection.clear();
        this.refreshCurrentList();
      });
    });
  }

  isAllSelected(): boolean {
    const visibleRows = this.getVisibleRows();
    return visibleRows.length > 0 && visibleRows.every(row => this.selection.isSelected(row));
  }

  hasVisibleSelection(): boolean {
    return this.getVisibleRows().some(row => this.selection.isSelected(row));
  }

  masterToggle(): void {
    const visibleRows = this.getVisibleRows();
    if (this.isAllSelected()) {
      visibleRows.forEach(row => this.selection.deselect(row));
    } else {
      visibleRows.forEach(row => this.selection.select(row));
    }
  }

  checkboxLabel(row?: Customers): string {
    if (!row) {
      return this.isAllSelected() ? 'Deseleziona tutti i clienti della pagina' : 'Seleziona tutti i clienti della pagina';
    }
    return `${this.selection.isSelected(row) ? 'Deseleziona' : 'Seleziona'} ${row.businessName}`;
  }

  UpdateItem(item: Customers){
    this.saveState();
    this.router.navigate(["/customer/add/" + item._id]);
  }

  private refreshCurrentList(): void {
    this.restoredPageIndex = this.paginator?.pageIndex ?? this.restoredPageIndex;
    this.restoredPageSize = this.paginator?.pageSize ?? this.restoredPageSize;
    this.saveState();
    const { name, province } = this.form.value;
    this.getCustomers(name, province);
  }

  private getVisibleRows(): Customers[] {
    const pageIndex = this.paginator?.pageIndex ?? 0;
    const pageSize = this.paginator?.pageSize ?? this.restoredPageSize;
    const start = pageIndex * pageSize;
    return this.dataSource.data.slice(start, start + pageSize);
  }

  private saveState(): void {
    if (!this.form) {
      return;
    }

    const state: CustomersState = {
      filters: this.form.value,
      pageIndex: this.paginator?.pageIndex ?? this.restoredPageIndex,
      pageSize: this.paginator?.pageSize ?? this.restoredPageSize
    };
    sessionStorage.setItem(CUSTOMERS_STATE_KEY, JSON.stringify(state));
  }

  private getSavedState(): CustomersState | null {
    const savedState = sessionStorage.getItem(CUSTOMERS_STATE_KEY);
    if (!savedState) {
      return null;
    }

    try {
      return JSON.parse(savedState) as CustomersState;
    } catch {
      sessionStorage.removeItem(CUSTOMERS_STATE_KEY);
      return null;
    }
  }

  private restorePaginatorPosition(): void {
    queueMicrotask(() => {
      if (!this.paginator) {
        return;
      }

      const pageSize = this.restoredPageSize || this.paginator.pageSize || 20;
      const lastPageIndex = Math.max(0, Math.ceil(this.dataSource.data.length / pageSize) - 1);
      this.paginator.pageSize = pageSize;
      this.paginator.pageIndex = Math.min(this.restoredPageIndex, lastPageIndex);
      this.dataSource.paginator = this.paginator;
      this.saveState();
    });
  }

  getElementStatus(status: string): string{
    switch(parseInt(status)){
      case 1:
        return "Attivo";
      case 2:
        return "Disattivo";
      case 3:
        return "Cancellato";
      default:
        return "";
    }
  }

}
