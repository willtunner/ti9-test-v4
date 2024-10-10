import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicFormComponent } from './components/dinamic-form/dynamic-form.component';
import { HomeComponent } from './components/home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ti9-test-v4';
}
