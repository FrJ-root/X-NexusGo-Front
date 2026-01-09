import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../core/auth/token.service';
import { Role } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  errorMessage: string = '';
  isLoading: boolean = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const roles = this.tokenService.getUserRoles();

        if (roles.includes(Role.ADMIN)) {
          this.router.navigate(['/admin']);
        } else if (roles.includes(Role.WAREHOUSE_MANAGER)) {
          this.router.navigate(['/warehouse']);
        } else if (roles.includes(Role.CLIENT)) {
          this.router.navigate(['/client']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403 || err.status === 401) {
          this.errorMessage = 'Identifiants incorrects.';
        } else {
          this.errorMessage = 'Erreur serveur. Réessayez plus tard.';
        }
      }
    });
  }
}
