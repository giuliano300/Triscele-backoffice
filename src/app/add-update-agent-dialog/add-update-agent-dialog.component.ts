import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FeathericonsModule } from "../icons/feathericons/feathericons.module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Agents } from '../interfaces/agents';

@Component({
  selector: 'app-add-update-agent-dialog',
  templateUrl: './add-update-agent-dialog.component.html',
  styleUrls: ['./add-update-agent-dialog.component.scss'],
  standalone:true,
  imports: [
    MatDialogModule, 
    MatCardContent, 
    MatCard, 
    MatFormField, 
    MatFormFieldModule,
    FeathericonsModule, 
    MatInputModule,
    MatIconModule,
    MatLabel, 
    CommonModule,
   ReactiveFormsModule]
})
export class AddUpdateAgentDialogComponent {
  
  title: string = "Aggiungi agente";

  categoryForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddUpdateAgentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:  Agents,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      email: ['']
    });
  }

  

  ngOnInit(): void {
    if(this.data){
      this.title = "Modifica agente";
      this.categoryForm.patchValue({
        name: this.data.name,
        email: this.data.email
      });
    }
  }

  onSave() {
    if (this.categoryForm.valid) {
      const result: Agents = {
        ...this.data!,
        ...this.categoryForm.value
      };
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
