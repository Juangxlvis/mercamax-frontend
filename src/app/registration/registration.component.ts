import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  error: string = '';
  passwordsMismatch: boolean = false;
  isLoading: boolean = false;
  email: string = '';
  uid: string = '';
  token: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      username: ['', Validators.required],
      password1: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.uid = params['uid'];
      this.token = params['token'];

      if (!this.uid || !this.token) {
        this.error = 'Enlace de activación inválido o caducado.';
      }else{
        this.validateToken();
      }
    });

    this.registrationForm.valueChanges.subscribe(() => {
      const password1 = this.registrationForm.get('password1')?.value;
      const password2 = this.registrationForm.get('password2')?.value;
      this.passwordsMismatch = password1 !== password2 && password1 && password2;
    });
  }

  validateToken(): void {
    const url = `http://127.0.0.1:8000/api/auth/validate-token/`;
    this.http.post(url, { uid: this.uid, token: this.token }).subscribe({
      next: (response: any) => {
        this.email = response.email;
        this.registrationForm.patchValue({
          username: response.username // Pre-llena el nombre de usuario.
        });
      },
      error: (err) => {
        this.error = err.error?.error || 'Enlace de activación inválido o caducado.';
      }
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid || this.passwordsMismatch) {
      this.error = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    const formData = {
      uid: this.uid,
      token: this.token,
      username: this.registrationForm.get('username')?.value,
      password1: this.registrationForm.get('password1')?.value,
      password2: this.registrationForm.get('password2')?.value,
    };

    this.http.post('http://127.0.0.1:8000/api/users/complete-registration/', formData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = response.detail || 'Usuario registrado exitosamente.';
          
          console.log('Usuario registrado exitosamente:', response);
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000); // <-- Redirige después de 3 segundos
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.error?.error || 'Error al registrar el usuario. Intente de nuevo.';
        }
      });
  }
}