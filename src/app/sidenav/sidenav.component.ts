import { Component, ViewChild } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';

import { navbarData } from './nav-data';
import { SidenavContentComponent } from "../sidenav-content/sidenav-content.component";
import { ModelService } from '../services/model.service';

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
      FormsModule,

      SidenavContentComponent,
    ]
})
export class SidenavComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  selectedModel = 'gpt-3.5-turbo';
  sidenavOpened = true;

  constructor(private modelService: ModelService) {}

  changeModel(event: any) {
    this.modelService.changeModel(event.target.value);
  }
  
  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  navData = navbarData;

  chat = {
    routeLink: 'chat',
    label: 'Chat',
    icon: 'chat'
  }
  
}
