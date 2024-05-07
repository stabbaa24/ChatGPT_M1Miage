import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";

import { MatToolbarModule } from '@angular/material/toolbar';

// Sidebar
import { SidenavComponent } from './sidenav/sidenav.component';
import { BodyComponent } from './sidebar/body/body.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        MatToolbarModule,

        SidenavComponent,
        NavbarComponent,
    ]
})
export class AppComponent {
  title = 'chatgpt_miage';
}
