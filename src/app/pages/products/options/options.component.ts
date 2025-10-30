import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { Options } from '../../../interfaces/options';
import { OptionsService } from '../../../services/Options.service';
import { AddUpdateProductsOptionsDialogComponent } from '../../../add-update-products-options-dialog/add-update-products-options-dialog.component';
import { OptionType, OptionTypeLabels } from '../../../enum/enum';


@Component({
  selector: 'app-options',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss'
})
export class OptionsComponent {

  Options: Options[] = [];

  displayedColumns: string[] = ['name', 'layer', 'optionType', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Options>(this.Options);

  OptionTypeLabels = OptionTypeLabels;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private OptionsService: OptionsService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getOptions();
   }

  getOptions(){
    this.OptionsService.getOptions()
    .subscribe((data: Options[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
      } 
      else 
      {
        this.Options = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<Options>(this.Options);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  OpenPopUp(item?:Options){
    const dialogRef = this.dialog.open(AddUpdateProductsOptionsDialogComponent, {
      data: item,
      width: '80vw',
      maxWidth: '1000px'
    });
    dialogRef.afterClosed().subscribe((result: Options) => {
      if (result) 
      {
        if(!item)
          this.OptionsService.setOptions(result)
            .subscribe((data: Options) => {
              if(data) 
                this.getOptions();
          });
        else
          this.OptionsService.updateOptions(result)
            .subscribe((success: boolean) => {
              if (success) 
                this.getOptions();
          });      
      } 
      else 
      {
        console.log("Close");
      }
    });  
  }

  DeleteItem(item:Options){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.OptionsService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.getOptions();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: Options){
    this.OpenPopUp(item);
  }


  getOptionName(n: number): string{
    const key = OptionType[n] as keyof typeof OptionType;
    return OptionTypeLabels[key];
  }
}
