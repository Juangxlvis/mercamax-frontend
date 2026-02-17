// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  username: string;
  rol?: string;
  trusted?: boolean;
}

export interface LoginResponse {
  step?: '2fa_required';
  token?: string;
  username?: string;
  rol?: string;
  trusted?: boolean;
}

export interface TwoFactorResponse {
  token: string;
  username: string;
  rol: string;
  trusted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth/';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Cargar usuario desde localStorage al inicializar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: { username: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}login/`, credentials).pipe(
      tap((response: LoginResponse) => {
        if (response.token && response.username) {
          localStorage.setItem('auth_token', response.token);
          const user: User = {
            username: response.username,
            rol: response.rol,
            trusted: response.trusted
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  verifyTwoFactor(payload: { code: string; temp_token: string }): Observable<TwoFactorResponse> {
    const headers = new HttpHeaders({
      Authorization: `Token ${payload.temp_token}`
    });
    return this.http.post<TwoFactorResponse>(`${this.apiUrl}verify-2fa/`, { code: payload.code }, { headers }).pipe(
      tap((response: TwoFactorResponse) => {
        if (response.token && response.username) {
          localStorage.setItem('auth_token', response.token);
          const user: User = {
            username: response.username,
            rol: response.rol,
            trusted: response.trusted
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isAdmin(): Observable<boolean> {
    return this.user$.pipe(
      map(user => user?.rol === 'GERENTE_SUPERMERCADO')
    );
  }

  hasRole(roles: string[]): Observable<boolean> {
    return this.user$.pipe(
      map(user => user?.rol ? roles.includes(user.rol) : false)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la solicitud.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = error.error?.detail || error.error?.non_field_errors?.[0] || `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}