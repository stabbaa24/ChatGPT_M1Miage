import { Component, ViewChild } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';

import { navbarData } from './nav-data';
import { SidenavContentComponent } from "../sidenav-content/sidenav-content.component";

@Component({
    selector: 'app-sidenav',
    standalone: true,
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.css',
    imports: [
      NgClass,
      NgFor,
      NgIf,
      RouterModule,
      MatToolbarModule,
      MatButtonModule,
      MatIconModule,
      MatSidenavModule,
      SidenavContentComponent
    ]
})
export class SidenavComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  toggleSidenav() {
    this.sidenav.toggle();
  }

  navData = navbarData;

}
