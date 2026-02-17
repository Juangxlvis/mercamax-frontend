import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink, RouterModule} from '@angular/router';
import { AuthService, LoginResponse, TwoFactorResponse } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  twoFactorForm: FormGroup;
  roles: {value:string; view_value: string} [] = [];
  errorMessage = '';
  loading = false;
  loadingRoles = true;
  showTwoFactor = false; 
  tempToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rol: ['', Validators.required]
    });
    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]], // Valida que sean 6 dígitos
      rememberDevice: [false]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
    const savedLogin = localStorage.getItem('login_data');
    if (savedLogin) {
      this.loginForm.patchValue(JSON.parse(savedLogin));
    }
    this.cargarRoles();
    }
    cargarRoles(): void{
      this.loadingRoles = true;
      this.http.get<{ value: string; view_value: string }[]>('https://mercamax-backend.onrender.com/api/users/api/roles/')
      .subscribe({
        next: (roles) => {
          console.log('Roles cargados:', roles);
          this.roles = roles;
          this.loadingRoles = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al cargar los roles.';
          this.roles = [
            { value: 'CAJERO', view_value: 'Cajero' },
            { value: 'ENCARGADO_INVENTARIO', view_value: 'Encargado de Inventario' },
            { value: 'GERENTE_COMPRAS', view_value: 'Gerente de Compras' },
            { value: 'GERENTE_SUPERMERCADO', view_value: 'Gerente del Supermercado' }
          ];
          this.loadingRoles = false;
        }
      });
  }
    onSubmit(): void{
    if (!this.loginForm.valid) return;
      this.loading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response:LoginResponse) => {
          if(response.step === '2fa_required'){
            this.tempToken = response.token || null; 
            this.showTwoFactor = true;
          } else if (response.token){
            localStorage.setItem('auth_token', response.token);
            this.router.navigate(['/inventario/productos']);
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.non_field_errors?.[0] || 'Error en el login.';
          this.loading = false;
        },
      });
    }

  onSubmitTwoFactor(): void {
    if (this.twoFactorForm.valid && this.tempToken) {
      this.loading = true;
      this.authService.verifyTwoFactor({
        code: this.twoFactorForm.value.code,
        temp_token: this.tempToken
      }).subscribe({
        next: (response: TwoFactorResponse) => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Autenticación de dos factores completada correctamente.',
            icon: 'success',
            confirmButtonColor: '#00bf63',
            confirmButtonText: 'Continuar'
          }).then(() => {
            localStorage.setItem('auth_token', response.token);
            this.router.navigate(['/inventario/productos']);
          });
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Código inválido o expirado.';
          this.loading = false;
        }
      });
    }
  }

  backToLogin(): void {
    this.showTwoFactor = false;
    this.twoFactorForm.reset();
    this.errorMessage = '';
  }
}
