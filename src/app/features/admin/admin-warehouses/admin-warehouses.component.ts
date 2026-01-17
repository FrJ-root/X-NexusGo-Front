import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WarehousesApiService } from '../../../api/warehouses-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Warehouse, Page } from '../../../shared/models';

@Component({
  selector: 'app-admin-warehouses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des entrepôts</h1>
          <p class="subtitle">Créez et gérez les entrepôts</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          ➕ Nouvel entrepôt
        </button>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="warehouses()"
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

      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingWarehouse() ? 'Modifier' : 'Créer' }} un entrepôt</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <form [formGroup]="warehouseForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="name">Nom *</label>
                  <input type="text" id="name" formControlName="name" />
                  @if (warehouseForm.get('name')?.errors?.['required'] && warehouseForm.get('name')?.touched) {
                    <span class="error">Le nom est requis</span>
                  }
                </div>
                <div class="form-group">
                  <label for="location">Localisation</label>
                  <input type="text" id="location" formControlName="location" />
                </div>
                <div class="form-group">
                  <label for="capacity">Capacité</label>
                  <input type="number" id="capacity" formControlName="capacity" min="0" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="warehouseForm.invalid || saving()">
                  @if (saving()) { <span class="spinner-sm"></span> }
                  {{ editingWarehouse() ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <app-confirm-dialog
        [isOpen]="showDeleteDialog()"
        title="Supprimer l'entrepôt"
        [message]="'Êtes-vous sûr de vouloir supprimer l\\'entrepôt ' + warehouseToDelete()?.name + ' ?'"
        confirmText="Supprimer"
        variant="danger"
        [loading]="deleting()"
        (confirm)="confirmDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }
    .btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; }
    .form-group input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .error { display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #ef4444; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminWarehousesComponent implements OnInit {
  private warehousesApi = inject(WarehousesApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  warehouses = signal<Warehouse[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);

  showModal = signal(false);
  editingWarehouse = signal<Warehouse | null>(null);
  saving = signal(false);

  showDeleteDialog = signal(false);
  warehouseToDelete = signal<Warehouse | null>(null);
  deleting = signal(false);

  warehouseForm = this.fb.group({
    name: ['', Validators.required],
    location: [''],
    capacity: [0]
  });

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'location', label: 'Localisation' },
    { key: 'capacity', label: 'Capacité', align: 'right' },
    { key: 'active', label: 'Actif', template: 'boolean' }
  ];

  actions: TableAction[] = [
    { icon: '✏️', label: 'Modifier', action: 'edit', variant: 'primary' },
    { icon: '🗑️', label: 'Supprimer', action: 'delete', variant: 'danger' }
  ];

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading.set(true);
    this.warehousesApi.getAll({ page: this.currentPage(), size: this.pageSize() }).subscribe({
      next: (page: Page<Warehouse>) => {
        this.warehouses.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadWarehouses();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadWarehouses();
  }

  onAction(event: { action: string; row: Warehouse }): void {
    if (event.action === 'edit') {
      this.openEditModal(event.row);
    } else if (event.action === 'delete') {
      this.warehouseToDelete.set(event.row);
      this.showDeleteDialog.set(true);
    }
  }

  openCreateModal(): void {
    this.editingWarehouse.set(null);
    this.warehouseForm.reset({ capacity: 0 });
    this.showModal.set(true);
  }

  openEditModal(warehouse: Warehouse): void {
    this.editingWarehouse.set(warehouse);
    this.warehouseForm.patchValue({
      name: warehouse.name,
      location: warehouse.location || '',
      capacity: warehouse.capacity || 0
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingWarehouse.set(null);
  }

  onSubmit(): void {
    if (this.warehouseForm.invalid) return;
    this.saving.set(true);

    const warehouse: Warehouse = {
      name: this.warehouseForm.value.name!,
      location: this.warehouseForm.value.location || undefined,
      capacity: this.warehouseForm.value.capacity || undefined
    };

    const request = this.editingWarehouse()
      ? this.warehousesApi.update(this.editingWarehouse()!.id!, warehouse)
      : this.warehousesApi.create(warehouse);

    (request as any).subscribe({
      next: () => {
        this.toast.success(this.editingWarehouse() ? 'Entrepôt modifié' : 'Entrepôt créé');
        this.closeModal();
        this.loadWarehouses();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  confirmDelete(): void {
    const warehouse = this.warehouseToDelete();
    if (!warehouse?.id) return;

    this.deleting.set(true);
    (this.warehousesApi.delete(warehouse.id) as any).subscribe({
      next: () => {
        this.toast.success('Entrepôt supprimé');
        this.showDeleteDialog.set(false);
        this.deleting.set(false);
        this.loadWarehouses();
      },
      error: () => this.deleting.set(false)
    });
  }
}
