import { Component } from '@angular/core';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { SubmissionsComponent } from './submissions/submissions.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [DynamicFormComponent, SubmissionsComponent]
})
export class AppComponent { }
