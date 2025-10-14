import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AgentService } from '../../services/Agent.service';
import { Agents } from '../../interfaces/agents';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AddUpdateAgentDialogComponent } from '../../add-update-agent-dialog/add-update-agent-dialog.component';

@Component({
  selector: 'app-agents',
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatTableModule, MatCheckboxModule],
  templateUrl: './agents.component.html',
  styleUrl: './agents.component.scss'
})
export class AgentsComponent {

  agents: Agents[] = [];

  displayedColumns: string[] = ['name', 'email', 'edit', 'delete'];

  dataSource = new MatTableDataSource<Agents>(this.agents);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
      private router: Router,
      private agentService: AgentService,
      private dialog: MatDialog
  ) {}

   ngOnInit(): void {
    this.getAgents();
   }

  getAgents(){
    this.agentService.getAgents()
    .subscribe((data: Agents[]) => {
      if (!data || data.length === 0) {
        console.log('Nessun dato disponibile');
      } 
      else 
      {
        this.agents = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
        }));;
        this.dataSource = new MatTableDataSource<Agents>(this.agents);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  OpenPopUp(item?:Agents){
    const dialogRef = this.dialog.open(AddUpdateAgentDialogComponent, {
      data: item,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe((result: Agents) => {
      if (result) 
      {
        if(!item)
          this.agentService.setAgent(result)
            .subscribe((data: Agents) => {
              if(data) 
                this.getAgents();
          });
        else
          this.agentService.updateAgent(result)
            .subscribe((success: boolean) => {
              if (success) 
                this.getAgents();
          });      
      } 
      else 
      {
        console.log("Close");
      }
    });  
  }

  DeleteItem(item: Agents){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.agentService.delete(item._id)
          .subscribe((data: boolean) => {
            if(data){
              this.getAgents();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  UpdateItem(item: Agents){
    this.OpenPopUp(item);
  }

}
