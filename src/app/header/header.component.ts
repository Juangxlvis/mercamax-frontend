// header.component.ts
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

import { NotificationsService } from '../services/notifications.service';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    //Cargar usuario
    this.loadUser();
    this.fetchNotifications();
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

    //Cargar usuario si ya está autenticado
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error al obtener notificaciones: ${error.message}`
        });
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
    this.unreadNotifications = this.notifications.filter(notif => !notif.read).length;
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {

        this.notifications.forEach(notif => notif.read = true);
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

}