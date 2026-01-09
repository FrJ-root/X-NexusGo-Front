import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-warehouse-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './warehouse-dashboard.component.html',
  styleUrl: './warehouse-dashboard.component.scss'
})
export class WarehouseDashboardComponent {
  private authService = inject(AuthService);
  logout() {
    this.authService.logout();
  }
}
