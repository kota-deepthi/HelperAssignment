import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HelperFormComponent } from './components/add-edit/add-edit.component';

export const routes: Routes = [
    {
        path:'',
        pathMatch: 'full',
        component: HomeComponent,
    },
    { 
        path: 'helper/add-helper', 
        component: HelperFormComponent 
    },
    { 
        path: 'helper/edit-helper/:id', 
        component:  HelperFormComponent
    },
];
