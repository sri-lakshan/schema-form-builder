import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../environments/environment.prod';

@Component({
  standalone: true,
  selector: 'app-submissions',
  imports: [CommonModule, HttpClientModule, MatCardModule],
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.css']
})
export class SubmissionsComponent implements OnInit {
  submissions: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/submissions`)
      .subscribe(data => this.submissions = data);
  }
}
