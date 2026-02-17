// header.component.ts
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationsService } from '../services/notifications.service';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatSnackBarModule],
  providers: [NotificationsService],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userName: string = 'Usuario';
  @Output() toggleMenu = new EventEmitter<void>();
  isDropdownOpen: boolean = false;
  isNotificationsOpen: boolean = false;
  notifications: any[] = [];
  unreadNotifications: number = 0;

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Cargar usuario
    this.loadUser();
    this.fetchNotifications();
  }

  loadUser(): void {
    this.authService.user$.subscribe({
      next: (user: User | null) => {
        this.userName = user ? user.username : 'Usuario';
      },
      error: (err) => {
        this.snackBar.open(`Error al cargar usuario: ${err.message}`, 'Cerrar', { duration: 3000 });
      }
    });

    // Cargar usuario si ya está autenticado
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
        this.notifications = data;
        this.updateUnreadCount();
      },
      error: (error) => {
        this.snackBar.open(`Error al obtener notificaciones: ${error.message}`, 'Cerrar', { duration: 3000 });
      }
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
    this.unreadNotifications = this.notifications.filter(notif => !notif.read).length;
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notif => notif.read = true);
        this.updateUnreadCount();
        this.snackBar.open('Notificaciones marcadas como leídas', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open(`Error al marcar notificaciones: ${error.message}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.snackBar.open('Sesión cerrada con éxito', 'Cerrar', { duration: 3000 });
    this.isDropdownOpen = false;
  }
}