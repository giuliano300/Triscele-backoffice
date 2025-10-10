import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SectorService } from '../../services/Sector.service';
import { Sectors } from '../../interfaces/sectors';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AddUpdateSectorDialogComponent } from '../../add-update-sector-dialog/add-update-sector-dialog.component';

@Component({
  selector: 'app-sectors',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './sectors.component.html',
  styleUrl: './sectors.component.scss'
})
export class SectorsComponent {

  sectors: Sectors[] = [];

  displayedColumns: string[] = ['name', 'description', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Sectors>(this.sectors);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private sectorService: SectorService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getSectors();
   }

  getSectors(){
    this.sectorService.getSectors()
    .subscribe((data: Sectors[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
      } 
      else 
      {
        this.sectors = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<Sectors>(this.sectors);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  OpenPopUp(item?: Sectors){
    const dialogRef = this.dialog.open(AddUpdateSectorDialogComponent, {
      data: item,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe((result: Sectors) => {
      if (result) 
      {
        if(!item)
          this.sectorService.setSector(result)
            .subscribe((data: Sectors) => {
              if(data) 
                this.getSectors();
          });
        else
          this.sectorService.updateSector(result)
            .subscribe((success: boolean) => {
              if (success) 
                this.getSectors();
          });      
      } 
      else 
      {
        console.log("Close");
      }
    });  
  }

  DeleteItem(item:Sectors){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.sectorService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.getSectors();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: Sectors){
    this.OpenPopUp(item);
  }

}
