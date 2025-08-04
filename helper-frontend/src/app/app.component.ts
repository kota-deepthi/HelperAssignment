import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AddHelperComponent } from './components/add-helper/add-helper.component';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AddHelperComponent, HttpClientModule, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'helper-frontend';

  constructor(private router: Router) {}
}
