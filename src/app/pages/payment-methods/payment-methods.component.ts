import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentMethodOption } from '../../interfaces/payment-method';
import { PaymentMethodService } from '../../services/PaymentMethod.service';
import { AddUpdatePaymentMethodDialogComponent } from '../../add-update-payment-method-dialog/add-update-payment-method-dialog.component';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatPaginatorModule, MatTableModule, MatDialogModule],
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.scss',
})
export class PaymentMethodsComponent implements OnInit {
  methods: PaymentMethodOption[] = [];
  readonly displayedColumns = ['name', 'position', 'enabled', 'edit'];
  dataSource = new MatTableDataSource<PaymentMethodOption>(this.methods);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private readonly paymentMethodService: PaymentMethodService, private readonly dialog: MatDialog) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.paymentMethodService.getPaymentMethods(true).subscribe(methods => {
      this.methods = methods.map(method => ({
        ...method,
        action: { edit: 'ri-edit-line' }
      }));
      this.dataSource = new MatTableDataSource<PaymentMethodOption>(this.methods);
      this.dataSource.paginator = this.paginator;
    });
  }

  openDialog(method?: PaymentMethodOption): void {
    const dialogRef = this.dialog.open(AddUpdatePaymentMethodDialogComponent, {
      width: '600px',
      data: method ?? null
    });
    dialogRef.afterClosed().subscribe((result: PaymentMethodOption | false) => {
      if (!result) return;
      const request = result._id ? this.paymentMethodService.update(result) : this.paymentMethodService.create(result);
      request.subscribe(() => this.load());
    });
  }
}
