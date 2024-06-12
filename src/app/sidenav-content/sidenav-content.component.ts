import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';

import { navbarData } from './nav-data';

@Component({
  selector: 'app-sidenav-content',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './sidenav-content.component.html',
  styleUrl: './sidenav-content.component.css'
})
export class SidenavContentComponent {
  navData = navbarData;
  
  chat = {
    routeLink: 'chat',
    label: 'Chat',
    icon: 'chat'
  }

}
