// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
  //private apiUrl = 'http://localhost:8000/api/auth/';
  private apiUrl = `${environment.apiUrl}/auth/`;

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private sessionTimeout: any;
  private readonly TIMEOUT_MS = 30 * 60 * 1000;

  constructor(private http: HttpClient, private router: Router) {

    // Cargar usuario desde localStorage al inicializar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));

      this.resetSessionTimer();
    }
  }

  resetSessionTimer(): void {
    if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
    this.sessionTimeout = setTimeout(() => {
      this.logout();
    }, this.TIMEOUT_MS);
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
          this.resetSessionTimer();
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
          this.resetSessionTimer();

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
    return throwError(() => error);
  }
}
