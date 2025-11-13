import { CommonModule, isPlatformBrowser} from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationCancel, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { ToggleService } from './common/header/toggle.service';
import { filter } from 'rxjs';
import { Location } from '@angular/common';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, SidebarComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
    providers: []
})
export class AppComponent {
  title = 'TRISCELE';

  constructor(
    public router: Router,  
    public toggleService: ToggleService, 
    private loc: Location,
    private socketService: SocketService,
    @Inject(PLATFORM_ID) private platformId: Object
) {
  this.toggleService.isToggled$.subscribe(isToggled => {
        this.isToggled = isToggled;
  });
}

  
    routerSubscription: any;
    location: any;

   // Toggle Service
   isToggled = false;

   // Dark Mode
   toggleTheme() {
       this.toggleService.toggleTheme();
   }

   // Settings Button Toggle
   toggle() {
       this.toggleService.toggle();
   }

   // ngOnInit
   ngOnInit(){
     const token = localStorage.getItem('authToken');
     if(!token && this.loc.path().indexOf("/reset-password") < 0)
        this.router.navigate(['/authentication']);
     
    if (isPlatformBrowser(this.platformId)) 
        this.recallJsFuntions();
    }
    // recallJsFuntions
    recallJsFuntions() {
        this.routerSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel))
            .subscribe(event => {
            this.location = this.router.url;
            if (!(event instanceof NavigationEnd)) {
                return;
            }
            this.scrollToTop();
        });
    }
    scrollToTop() {
        if (isPlatformBrowser(this.platformId)) {
            window.scrollTo(0, 0);
        }
    }
}
