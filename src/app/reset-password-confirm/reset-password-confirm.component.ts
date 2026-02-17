// src/app/reset-password-confirm/reset-password-confirm.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password-confirm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password-confirm.component.html',
  styleUrls: ['./reset-password-confirm.component.scss']
})
export class ResetPasswordConfirmComponent implements OnInit {
  resetForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  uid = '';
  token = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      new_password1: ['', [Validators.required, Validators.minLength(8)]],
      new_password2: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.uid = params['uid'];
      this.token = params['token'];
      if (!this.uid || !this.token) {
        this.errorMessage = 'Enlace de restablecimiento inválido.';
      }
    });

    this.resetForm.valueChanges.subscribe(() => {
      const new_password1 = this.resetForm.get('new_password1')?.value;
      const new_password2 = this.resetForm.get('new_password2')?.value;
      this.resetForm.setErrors(new_password1 !== new_password2 && new_password1 && new_password2 ? { mismatch: true } : null);
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.resetForm.errors?.['mismatch']) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = {
      new_password1: this.resetForm.get('new_password1')?.value,
      new_password2: this.resetForm.get('new_password2')?.value
    };

    this.http.post(`http://127.0.0.1:8000/api/users/password/reset/confirm/${this.uid}/${this.token}/`, formData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...';
          this.errorMessage = '';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Error al restablecer la contraseña. Intente de nuevo.';
          this.successMessage = '';
        }
      });
  }
}