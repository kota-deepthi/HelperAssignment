import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AddHelperComponent } from './components/add-helper/add-helper.component';
import { HomeComponent } from './home/home.component';
import { EditHelperComponent } from './components/edit-helper/edit-helper.component';
import { HelperFormComponent } from './components/add-edit/add-edit.component';

export const routes: Routes = [
    {
        path: 'add-helper',
        component: AddHelperComponent
    },
    {
        path:'',
        pathMatch: 'full',
        component: HomeComponent,
    },
    {
        path:'edit-helper/:id',
        component: EditHelperComponent
    },
    { path: 'helper/add-helper', component: HelperFormComponent },
    { path: 'helper/edit-helper/:id', component:  HelperFormComponent},
];
