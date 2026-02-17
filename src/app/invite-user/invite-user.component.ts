import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-invite-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.scss']
})
export class InviteUserComponent implements OnInit {
  inviteForm!: FormGroup;
  roles: any[] = [];
  loadingRoles = true;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      first_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required]
    });

    this.loadRoles();
  }

  loadRoles() {
    this.http.get<any[]>('http://localhost:8000/api/users/api/roles/').subscribe({
      next: (data) => {
        this.roles = data;
        this.loadingRoles = false;
      },
      error: () => {
        this.roles = [];
        this.loadingRoles = false;
      }
    });
  }

  onSubmit() {
    if (this.inviteForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const token = '5341698d83440a4da037d67438ce1d52ad692d9b'; //Token hardcodeado solo para pruebas

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });

    this.http.post('https://mercamax-backend.onrender.com/api/users/admin/invite/', this.inviteForm.value, { headers })
      .subscribe({
        next: () => {
          this.successMessage = 'Invitación enviada exitosamente ✅';
          this.inviteForm.reset();
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.detail || 'Error al enviar la invitación ❌';
          this.loading = false;
        }
      });
  }
}
