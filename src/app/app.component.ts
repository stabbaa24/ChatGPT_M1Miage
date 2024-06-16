import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

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
        BodyComponent,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule
        
    ]
})
export class AppComponent {
  title = 'chatgpt_miage';
}
