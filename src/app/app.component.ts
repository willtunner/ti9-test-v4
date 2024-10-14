import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { BodyComponent } from './components/body/body.component';
import { AppSidenavComponent } from './components/app-sidenav/app-sidenav.component';

interface SideNaveToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent, RouterOutlet, AppSidenavComponent, BodyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ti9-test-v4';

  isSideNavCollapsed = false;
  screenWidth = 0;
  
  onToggleSideNav(data: SideNaveToggle): void {
    this.screenWidth = data.screenWidth;
  this.isSideNavCollapsed = data.collapsed;

  }
}
