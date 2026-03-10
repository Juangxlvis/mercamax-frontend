// header.component.ts
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NotificationsService } from '../services/notifications.service';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  userName: string = 'Usuario';
  @Output() toggleMenu = new EventEmitter<void>();

  isDropdownOpen: boolean = false;
  isNotificationsOpen: boolean = false;

  notifications: any[] = [];
  unreadNotifications: number = 0;

  private notificacionesInterval: any;

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.fetchNotifications();

    // Consulta notificaciones cada 2 minutos automáticamente
    this.notificacionesInterval = setInterval(() => {
      this.fetchNotifications();
    }, 2 * 60 * 1000);
  }

  ngOnDestroy(): void {
    if (this.notificacionesInterval) {
      clearInterval(this.notificacionesInterval);
    }
  }

  loadUser(): void {
    this.authService.user$.subscribe({
      next: (user: User | null) => {
        this.userName = user ? user.username : 'Usuario';
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error al cargar usuario: ${err.message}`
        });
      }
    });

    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.userName = currentUser.username;
      }
    }
  }

  toggleSidebar(): void {
    this.toggleMenu.emit();
  }

  fetchNotifications(): void {
    this.notificationsService.getNotifications().subscribe({
      next: (data) => {
        const previousUnread = this.unreadNotifications;
        this.notifications = data;
        this.updateUnreadCount();

        if (this.unreadNotifications > previousUnread) {
          this.showNotificationToast();
        }
      },
      error: (error) => {
        // Silencioso en polling para no spamear alertas cada 2 minutos
        console.error('Error al obtener notificaciones:', error.message);
      }
    });
  }

  showNotificationToast(): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Nueva notificación',
      text: 'Tienes nuevas notificaciones',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isNotificationsOpen) {
      this.isNotificationsOpen = false;
    }
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  updateUnreadCount(): void {
    this.unreadNotifications = this.notifications.filter(notif => !notif.leida).length;
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notif => notif.leida = true);
        this.updateUnreadCount();

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Notificaciones marcadas como leídas',
          showConfirmButton: false,
          timer: 2500
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error al marcar notificaciones: ${error.message}`
        });
      }
    });
  }

  logout(): void {
    // Limpiar el intervalo al cerrar sesión
    if (this.notificacionesInterval) {
      clearInterval(this.notificacionesInterval);
    }

    this.authService.logout();

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Sesión cerrada correctamente',
      showConfirmButton: false,
      timer: 2500
    });

    this.isDropdownOpen = false;
  }

  deleteNotification(event: Event, id: number): void {
    event.stopPropagation(); // Evita que cierre el dropdown
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateUnreadCount();
      },
      error: () => console.error('Error al eliminar notificación')
    });
  }
}
