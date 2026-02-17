import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { LayoutComponent } from "./layout/layout.component";
import { RegistrationComponent } from "./registration/registration.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, LayoutComponent, RegistrationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mercamax-frontend';
}
