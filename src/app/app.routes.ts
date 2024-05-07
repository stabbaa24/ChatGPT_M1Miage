import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
    {
        'path': 'home',
        component: ChatComponent,
        title: 'Home'
    },
    {
        'path': '',
        component: ChatComponent,
        title: 'Home'
    }
];
