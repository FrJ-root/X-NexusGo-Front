import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../shared/services/toast.service';
import { User, Role } from '../../../shared/models/business.models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Gestion des Utilisateurs</h1>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="users()"
        [totalElements]="totalElements()"
        (pageChange)="onPageChange($event)"
        (actionClick)="onToggleActive($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  totalElements = signal(0);
  currentPage = 0;
  pageSize = 10;

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle', template: 'badge' },
    { key: 'active', label: 'Actif', template: 'boolean' },
    { key: 'actions', label: 'Toggle Status', template: 'actions' }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.users.set(data.content || []);
        this.totalElements.set(data.totalElements || 0);
      },
      error: () => this.toastService.show('Erreur chargement utilisateurs', 'error')
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  onToggleActive(event: { action: string, row: User }) {
    const user = event.row;
    this.userService.toggleActive(user.id).subscribe({
      next: () => {
        this.toastService.show(`Statut de ${user.email} mis à jour`, 'success');
        this.loadUsers();
      },
      error: () => this.toastService.show('Erreur lors de la mise à jour', 'error')
    });
  }
}
