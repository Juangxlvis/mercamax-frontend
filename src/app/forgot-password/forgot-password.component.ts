import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  form: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

    onSubmit() {
  if (this.form.valid) {
    this.http.post('https://mercamax-backend.onrender.com/api/users/password/reset/', this.form.value)
      .subscribe({
        next: (res: any) => {
          // Mostrar mensaje bonito en lugar de alert()
          this.successMessage = res.detail;
          this.form.reset();  // Limpiar el formulario
        },
        error: (err) => {
          this.errorMessage = err.error?.email || 'Ocurrió un error';
        }
      });
  }
    }
}

