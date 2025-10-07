import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  standalone:true,
  imports: [MatDialogModule]
})
export class ConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  title = "CONFERMA ELIMINAZIONE";
  description = "Sei sicuro di voler eliminare questo elemento?";
  confirm = "Cancella";

  ngOnInit(): void {
    if(this.data)
    {
      this.title = this.data.title;
      this.description = this.data.description;
      this.confirm = this.data.confirm;
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true); // L'utente ha confermato
  }

  onCancel(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
