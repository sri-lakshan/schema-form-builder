import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubmissionsComponent } from '../submissions/submissions.component';

//for json
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

//for exporting
import { pipe } from 'fp-ts/function';
import { tryCatch, fold } from 'fp-ts/Either';

import schema from '../schema.json';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';

@Component({
  standalone: true,
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, SubmissionsComponent]
})

export class DynamicFormComponent implements OnInit {
  form: FormGroup;
  schema: any = schema;
  ajv: Ajv;
  validateFn: any;
  errors: any = {};

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.validateFn = this.ajv.compile(this.schema);
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    const controlsConfig: any = {};

    if (!this.schema || !this.schema.properties || Object.keys(this.schema.properties).length === 0) {
      this.snackBar.open(
        'Alert! You have not uploaded any schema yet. Please click on the import button to import your schema.',
        'Close',
        { duration: 9000 }
      );
      return;
    }

    for (let key in this.schema.properties) {
      const field = this.schema.properties[key];
      const validators = [];

      if (this.schema.required?.includes(key)) {
        validators.push(Validators.required);
      }

      if (field.type === 'string' && field.format === 'email') {
        validators.push(Validators.email);
      }

      if (field.type === 'number' && field.minimum != null) {
        validators.push(Validators.min(field.minimum));
      }

      controlsConfig[key] = ['', validators];
    }

    this.form = this.fb.group(controlsConfig);

    this.form.valueChanges.subscribe(() => this.validateForm());
  }

  validateForm() {
    const rawValue = this.form.getRawValue();
    const parsedValue = { ...rawValue };

    for (let key in this.schema.properties) {
      if (this.schema.properties[key].type === 'number') {
        parsedValue[key] = Number(parsedValue[key]);
      }
    }

    this.errors = {};
    const valid = this.validateFn(parsedValue);

    if (!valid && this.validateFn.errors) {
      this.validateFn.errors.forEach((err: { instancePath: string; message: any; }) => {
        const field = err.instancePath.replace('/', '');
        const control = this.form.get(field);

        if (control && (control.dirty || control.touched)) {
          this.errors[field] = err.message;
        }
      });
}

  }

  onSubmit() {
    Object.values(this.form.controls).forEach(control => control.markAsTouched());
    this.validateForm();
    
    const rawData = { ...this.form.value };

    for (let key in this.schema.properties) {
      if (this.schema.properties[key].type === 'number') {
        rawData[key] = Number(rawData[key]);
      }
    }

    const payload = {
      schema: this.schema,
      data: rawData
    };

    this.http.post(`${environment.apiBaseUrl}/submit`, payload).subscribe({
      next: res => this.snackBar.open('Form submitted to server!', 'Close', { duration: 3000 }),
      error: err => {
        this.snackBar.open('Please check the errors before submitting!', 'Close', { duration: 3000 });
        console.error('Submission failed:', err);
      }
    });
  }

  buildForm() {
    const formGroup: any = {};
    for (const field in this.schema.properties) {
      const fieldSchema = this.schema.properties[field];
      const validators = [];

      if ((this.schema.required || []).includes(field)) {
        validators.push(Validators.required);
      }

      if (fieldSchema.type === 'string' && fieldSchema.format === 'email') {
        validators.push(Validators.email);
      }

      if (fieldSchema.type === 'number' && fieldSchema.minimum != null) {
        validators.push(Validators.min(fieldSchema.minimum));
      }

      formGroup[field] = new FormControl('', validators);
    }

    this.form = new FormGroup(formGroup);
    this.validateFn = this.ajv.compile(this.schema);
    this.form.valueChanges.subscribe(() => this.validateForm());
    this.validateForm();
  }


  exportForm() {
    const downloadJSON = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    };

    pipe(
    tryCatch(
      () => JSON.stringify({ schema: this.schema, data: this.form.value }, null, 2),
      reason => new Error(String(reason))
    ),
    fold(
      err => console.error('Export failed:', err.message),
      json => downloadJSON(json, 'form-export.json')
    )
  );
    this.snackBar.open('Form exported successfully!', 'Close', { duration: 3000 });
}

  importForm(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const parsed = JSON.parse(e.target.result);

        if (parsed.schema && parsed.data) {
          this.schema = parsed.schema;
          this.buildForm();
          this.form.patchValue(parsed.data);
          Object.values(this.form.controls).forEach(control => control.markAsTouched());
          this.validateForm();
          this.snackBar.open('Imported the data/schema successfully!', 'Close', { duration: 3000 });
        }

        else if (parsed.type === 'object' && parsed.properties) {
          this.schema = parsed;
          this.buildForm();
          this.snackBar.open('Imported the data/schema successfully!', 'Close', { duration: 3000 });
        }

        else {
          this.snackBar.open('Invalid file format!', 'Close', { duration: 3000 });
        }

      } catch (err) {
        console.error("Error reading file:", err);
        this.snackBar.open('Failed to parse JSON. Please upload a valid file.', 'Close', { duration: 3000 });
      }
    };

    reader.readAsText(file);
  }

  showSchema = false;

  toggleSchemaView() {
    if(this.showSubmissions) this.showSubmissions = false;

    this.showSchema = !this.showSchema;
  }

  viewSubmissions() {
    this.http.get(`${environment.apiBaseUrl}/submissions`).subscribe({
      next: res => {
        const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        window.open(url);
      },
      error: err => {
        this.snackBar.open('Failed to fetch submissions!', 'Close', { duration: 3000 });
        console.error('Fetch error:', err);
      }
    });
  }

  showSubmissions = false;

  toggleSubmissions() {
    if(this.showSchema) this.showSchema = false;

    this.showSubmissions = !this.showSubmissions;
  }

}
