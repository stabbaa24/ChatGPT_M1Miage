import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
    {
        'path': 'home',
        component: HomeComponent,
        title: 'Home'
    },
    {
        'path': 'about',
        component: AboutComponent,
        title: 'About'
    },
    {
        'path': 'chat',
        component: ChatComponent,
        title: 'chat'
    },
    {
        path: '', 
        redirectTo: '/home', 
        pathMatch: 'full' 
    },
    { 
        path: '**', 
        redirectTo: '/home', 
        pathMatch: 'full' 
    }


];
