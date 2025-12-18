import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-not-visible',
  imports: [ MatCardModule, MatButtonModule],
  templateUrl: './dashboard-not-visible.component.html',
  styleUrl: './dashboard-not-visible.component.scss'
})
export class DashboardNotVisibleComponent {

  constructor(
      private router: Router,
      private authService: AuthService,
    ) 
    {
    }
  

  private subscription: Subscription = new Subscription();
  
 ngOnInit(): void {
  const isOperator = localStorage.getItem('isOperator') === 'true';
      if (isOperator) {
          const o = JSON.parse(localStorage.getItem('operator') || '{}');
          const operatorId = o.sub;  
          this.authService.ping(operatorId).subscribe((data) =>{
              if(data)
                  this.router.navigate(['/operator/dashboard']);
          });
  
          this.subscription = interval(5000).subscribe(() => { // ogni 5s
              this.authService.ping(operatorId).subscribe((data) =>{
                  if(data)
                      this.router.navigate(['/operator/dashboard']);
              });
          });        
      }
    }
}
