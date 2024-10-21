import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { FormServiceService } from '../../services/form-service.service';
import { INavbarData } from '../../interface/side-nav.interface';
import { AppSublevelMenuComponent } from '../app-sublevel-menu/app-sublevel-menu.component';

interface SideNaveToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIconModule, AppSublevelMenuComponent],
  templateUrl: './app-sidenav.component.html',
  styleUrl: './app-sidenav.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('350ms',
          style({opacity: 1})
        )
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('350ms',
          style({opacity: 0})
        )
      ])
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms',
          keyframes([
            style({transform: 'rotate(0deg)', offset: '0'}),
            style({transform: 'rotate(2turn)', offset: '1'}),
          ])
        )
      ])
    ])
  ]
})

export class AppSidenavComponent implements OnInit {

  @Output() onToggleSideNav: EventEmitter<SideNaveToggle> = new EventEmitter();
  screenWidth = 0;
  collapsed = false;
  navData: INavbarData[] = [];
  multiple: boolean = false;

  constructor(private sidenavBar: FormServiceService, public router: Router) { }

  @HostListener('window:resize', ['$event'])

  onResize(event: any) {
    this.screenWidth = window.innerWidth;

    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({
        collapsed: this.collapsed,
        screenWidth: this.screenWidth,
      });
    }
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.sidenavBar.getSideNavBar().subscribe((data: INavbarData[]) => {
      console.log('dataNavSide: ', data);
      this.navData = data;
    });
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth
    });
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth
    });
  }

  handleClick(item: INavbarData): void {
    this.shrinkItems(item);
    item.expanded = !item.expanded;
  }

  getActiveClass(data: INavbarData): string {
    return this.router.url.includes(data.routeLink) ? 'active' : '';
  }

  shrinkItems(item: INavbarData): void {
    if (!this.multiple) {
      for (let modelItem of this.navData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
  }

}
