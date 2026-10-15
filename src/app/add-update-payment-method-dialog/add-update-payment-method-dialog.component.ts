import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCard, MatCardContent } from '@angular/material/card';
import { FeathericonsModule } from '../icons/feathericons/feathericons.module';
import { PaymentMethodOption } from '../interfaces/payment-method';

@Component({
  selector: 'app-add-update-payment-method-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatCard, MatCardContent, FeathericonsModule],
  templateUrl: './add-update-payment-method-dialog.component.html',
  styleUrl: './add-update-payment-method-dialog.component.scss'
})
export class AddUpdatePaymentMethodDialogComponent {
  readonly isEdit: boolean;
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AddUpdatePaymentMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: PaymentMethodOption | null
  ) {
    this.isEdit = Boolean(this.data?._id);
    this.form = this.fb.group({
      name: [this.data?.name ?? '', Validators.required],
      position: [this.data?.position ?? 0, [Validators.required, Validators.min(0)]],
      enabled: [this.data?.enabled ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close({ ...this.data, ...this.form.getRawValue() } as PaymentMethodOption);
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
