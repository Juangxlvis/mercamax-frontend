import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha_creacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private apiUrl = `${environment.apiUrl}/notificaciones/`;

  constructor(private http: HttpClient) {}

  getNotifications() {
    const token = localStorage.getItem('token');

    return this.http.get<any[]>(this.apiUrl, {
      headers: {
        Authorization: `Token ${token}`
      }
    });
  }
  markAllAsRead() {
    return this.http.post(`${this.apiUrl}/marcar-todas-leidas/`, {});
  }

}