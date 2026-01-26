import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersApiService } from '../../../api/users-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../shared/services/toast.service';
import { User, Page, Role } from '../../../shared/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    SearchFiltersComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p class="subtitle">Créez, modifiez et gérez les comptes utilisateurs</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          ➕ Nouvel utilisateur
        </button>
      </div>

      <app-search-filters
        [fields]="filterFields"
        [values]="filterValues()"
        (valuesChange)="filterValues.set($event)"
        (search)="onSearch($event)"
        (reset)="onReset()"
      />

      <app-data-table
        [columns]="columns"
        [data]="users()"
        [actions]="actions"
        [loading]="loading()"
        [totalElements]="totalElements()"
        [totalPages]="totalPages()"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
        (actionClick)="onAction($event)"
      />

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingUser() ? 'Modifier' : 'Créer' }} un utilisateur</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="name">Nom *</label>
                  <input type="text" id="name" formControlName="name" />
                  @if (userForm.get('name')?.errors?.['required'] && userForm.get('name')?.touched) {
                    <span class="error">Le nom est requis</span>
                  }
                </div>

                <div class="form-group">
                  <label for="email">Email *</label>
                  <input type="email" id="email" formControlName="email" />
                  @if (userForm.get('email')?.errors?.['required'] && userForm.get('email')?.touched) {
                    <span class="error">L'email est requis</span>
                  }
                  @if (userForm.get('email')?.errors?.['email'] && userForm.get('email')?.touched) {
                    <span class="error">Email invalide</span>
                  }
                </div>

                @if (!editingUser()) {
                  <div class="form-group">
                    <label for="password">Mot de passe *</label>
                    <input type="password" id="password" formControlName="password" />
                    @if (userForm.get('password')?.errors?.['required'] && userForm.get('password')?.touched) {
                      <span class="error">Le mot de passe est requis</span>
                    }
                    @if (userForm.get('password')?.errors?.['minlength'] && userForm.get('password')?.touched) {
                      <span class="error">Minimum 6 caractères</span>
                    }
                  </div>
                }

                <div class="form-group">
                  <label for="role">Rôle *</label>
                  <select id="role" formControlName="role">
                    <option value="">Sélectionner un rôle</option>
                    <option value="ADMIN">Administrateur</option>
                    <option value="WAREHOUSE_MANAGER">Gestionnaire d'entrepôt</option>
                    <option value="CLIENT">Client</option>
                  </select>
                  @if (userForm.get('role')?.errors?.['required'] && userForm.get('role')?.touched) {
                    <span class="error">Le rôle est requis</span>
                  }
                </div>

                <div class="form-group">
                  <label for="contactInfo">Contact</label>
                  <input type="text" id="contactInfo" formControlName="contactInfo" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || saving()">
                  @if (saving()) {
                    <span class="spinner-sm"></span>
                  }
                  {{ editingUser() ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <app-confirm-dialog
        [isOpen]="showDeleteDialog()"
        title="Supprimer l'utilisateur"
        [message]="'Êtes-vous sûr de vouloir supprimer ' + userToDelete()?.name + ' ?'"
        confirmText="Supprimer"
        variant="danger"
        [loading]="deleting()"
        (confirm)="confirmDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />

      <app-confirm-dialog
        [isOpen]="showToggleDialog()"
        [title]="userToToggle()?.enabled ? 'Désactiver' : 'Activer' + ' l\\'utilisateur'"
        [message]="'Êtes-vous sûr de vouloir ' + (userToToggle()?.enabled ? 'désactiver' : 'activer') + ' ' + userToToggle()?.name + ' ?'"
        [confirmText]="userToToggle()?.enabled ? 'Désactiver' : 'Activer'"
        [variant]="userToToggle()?.enabled ? 'warning' : 'primary'"
        [loading]="toggling()"
        (confirm)="confirmToggle()"
        (cancel)="showToggleDialog.set(false)"
      />
    </div>
  `,
  styles: [`
    .page {
      max-width: 1400px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #111827;
    }

    .subtitle {
      margin: 0.25rem 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .btn {
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.125rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #ef4444;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  private usersApi = inject(UsersApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  // Data
  users = signal<User[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);

  // Filters
  filterValues = signal<Record<string, any>>({});

  // Modal
  showModal = signal(false);
  editingUser = signal<User | null>(null);
  saving = signal(false);

  // Delete dialog
  showDeleteDialog = signal(false);
  userToDelete = signal<User | null>(null);
  deleting = signal(false);

  // Toggle dialog
  showToggleDialog = signal(false);
  userToToggle = signal<User | null>(null);
  toggling = signal(false);

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required],
    contactInfo: ['']
  });

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Rôle', template: 'status' },
    { key: 'enabled', label: 'Actif', template: 'boolean' },
    { key: 'createdAt', label: 'Créé le', template: 'date', sortable: true }
  ];

  actions: TableAction[] = [
    { icon: '✎', label: 'Modifier', action: 'edit', variant: 'primary' },
    { 
      icon: '🔄', 
      label: 'Activer/Désactiver', 
      action: 'toggle', 
      variant: 'warning' 
    },
    { icon: '✕', label: 'Supprimer', action: 'delete', variant: 'danger' }
  ];

  filterFields: FilterField[] = [
    { key: 'name', label: 'Nom', type: 'text', placeholder: 'Rechercher...' },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'email@...' },
    { 
      key: 'role', 
      label: 'Rôle', 
      type: 'select',
      options: [
        { value: 'ADMIN', label: 'Administrateur' },
        { value: 'WAREHOUSE_MANAGER', label: 'Gestionnaire' },
        { value: 'CLIENT', label: 'Client' }
      ]
    },
    { key: 'enabled', label: 'Actif', type: 'boolean' }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const filters = this.filterValues();
    
    this.usersApi.search(filters, { 
      page: this.currentPage(), 
      size: this.pageSize() 
    }).subscribe({
      next: (page: Page<User>) => {
        this.users.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearch(filters: Record<string, any>): void {
    this.filterValues.set(filters);
    this.currentPage.set(0);
    this.loadUsers();
  }

  onReset(): void {
    this.filterValues.set({});
    this.currentPage.set(0);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadUsers();
  }

  onAction(event: { action: string; row: User }): void {
    switch (event.action) {
      case 'edit':
        this.openEditModal(event.row);
        break;
      case 'delete':
        this.userToDelete.set(event.row);
        this.showDeleteDialog.set(true);
        break;
      case 'toggle':
        this.userToToggle.set(event.row);
        this.showToggleDialog.set(true);
        break;
    }
  }

  openCreateModal(): void {
    this.editingUser.set(null);
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.editingUser.set(user);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      contactInfo: user.contactInfo || ''
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.saving.set(true);
    const formValue = this.userForm.value;
    const user: User = {
      name: formValue.name!,
      email: formValue.email!,
      role: formValue.role!,
      contactInfo: formValue.contactInfo || undefined,
      password: formValue.password || undefined
    };

    const request = this.editingUser()
      ? this.usersApi.update(this.editingUser()!.id!, user)
      : this.usersApi.create(user);

    (request as any).subscribe({
      next: () => {
        this.toast.success(this.editingUser() ? 'Utilisateur modifié' : 'Utilisateur créé');
        this.closeModal();
        this.loadUsers();
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user?.id) return;

    this.deleting.set(true);
    (this.usersApi.delete(user.id) as any).subscribe({
      next: () => {
        this.toast.success('Utilisateur supprimé');
        this.showDeleteDialog.set(false);
        this.userToDelete.set(null);
        this.deleting.set(false);
        this.loadUsers();
      },
      error: () => {
        this.deleting.set(false);
      }
    });
  }

  confirmToggle(): void {
    const user = this.userToToggle();
    if (!user?.id) return;

    this.toggling.set(true);
    const request = user.enabled 
      ? this.usersApi.disable(user.id)
      : this.usersApi.enable(user.id);

    (request as any).subscribe({
      next: () => {
        this.toast.success(user.enabled ? 'Utilisateur désactivé' : 'Utilisateur activé');
        this.showToggleDialog.set(false);
        this.userToToggle.set(null);
        this.toggling.set(false);
        this.loadUsers();
      },
      error: () => {
        this.toggling.set(false);
      }
    });
  }
}
