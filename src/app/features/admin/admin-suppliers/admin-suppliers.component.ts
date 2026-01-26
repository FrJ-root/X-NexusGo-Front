import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SuppliersApiService } from '../../../api/suppliers-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Supplier } from '../../../shared/models';

@Component({
  selector: 'app-admin-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    SearchFiltersComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des fournisseurs</h1>
          <p class="subtitle">Gérez vos partenaires fournisseurs</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          ➕ Nouveau fournisseur
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
        [data]="suppliers()"
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
              <h2>{{ editingSupplier() ? 'Modifier' : 'Créer' }} un fournisseur</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="name">Nom *</label>
                  <input type="text" id="name" formControlName="name" />
                </div>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" formControlName="email" />
                </div>
                <div class="form-group">
                  <label for="phone">Téléphone</label>
                  <input type="text" id="phone" formControlName="phone" />
                </div>
                <div class="form-group">
                  <label for="address">Adresse</label>
                  <textarea id="address" formControlName="address" rows="2"></textarea>
                </div>
                <div class="form-group">
                  <label for="contactInfo">Informations de contact</label>
                  <input type="text" id="contactInfo" formControlName="contactInfo" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="supplierForm.invalid || saving()">
                  @if (saving()) { <span class="spinner-sm"></span> }
                  {{ editingSupplier() ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <app-confirm-dialog
        [isOpen]="showDeleteDialog()"
        title="Supprimer le fournisseur"
        [message]="'Supprimer ' + supplierToDelete()?.name + ' ?'"
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
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group textarea { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminSuppliersComponent implements OnInit {
  private suppliersApi = inject(SuppliersApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  suppliers = signal<Supplier[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filterValues = signal<Record<string, any>>({});

  showModal = signal(false);
  editingSupplier = signal<Supplier | null>(null);
  saving = signal(false);

  showDeleteDialog = signal(false);
  supplierToDelete = signal<Supplier | null>(null);
  deleting = signal(false);

  supplierForm = this.fb.group({
    name: ['', Validators.required],
    email: [''],
    phone: [''],
    address: [''],
    contactInfo: ['']
  });

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'active', label: 'Actif', template: 'boolean' }
  ];

  actions: TableAction[] = [
    { icon: '✎', label: 'Modifier', action: 'edit', variant: 'primary' },
    { icon: '☰', label: 'Voir les PO', action: 'viewPOs', variant: 'success' },
    { icon: '✕', label: 'Supprimer', action: 'delete', variant: 'danger' }
  ];

  filterFields: FilterField[] = [
    { key: 'name', label: 'Nom', type: 'text', placeholder: 'Nom...' },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'Email...' },
    { key: 'active', label: 'Actif', type: 'boolean' }
  ];

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading.set(true);
    this.suppliersApi.search(this.filterValues(), { page: this.currentPage(), size: this.pageSize() }).subscribe({
      next: (page) => {
        this.suppliers.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(filters: Record<string, any>): void {
    this.filterValues.set(filters);
    this.currentPage.set(0);
    this.loadSuppliers();
  }

  onReset(): void {
    this.filterValues.set({});
    this.currentPage.set(0);
    this.loadSuppliers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSuppliers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadSuppliers();
  }

  onAction(event: { action: string; row: Supplier }): void {
    switch (event.action) {
      case 'edit':
        this.openEditModal(event.row);
        break;
      case 'delete':
        this.supplierToDelete.set(event.row);
        this.showDeleteDialog.set(true);
        break;
    }
  }

  openCreateModal(): void {
    this.editingSupplier.set(null);
    this.supplierForm.reset();
    this.showModal.set(true);
  }

  openEditModal(supplier: Supplier): void {
    this.editingSupplier.set(supplier);
    this.supplierForm.patchValue({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      contactInfo: supplier.contactInfo || ''
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingSupplier.set(null);
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) return;
    this.saving.set(true);

    const supplier: Supplier = {
      name: this.supplierForm.value.name!,
      email: this.supplierForm.value.email || undefined,
      phone: this.supplierForm.value.phone || undefined,
      address: this.supplierForm.value.address || undefined,
      contactInfo: this.supplierForm.value.contactInfo || undefined
    };

    const request = this.editingSupplier()
      ? this.suppliersApi.update(this.editingSupplier()!.id!, supplier)
      : this.suppliersApi.create(supplier);

    request.subscribe({
      next: () => {
        this.toast.success(this.editingSupplier() ? 'Fournisseur modifié' : 'Fournisseur créé');
        this.closeModal();
        this.loadSuppliers();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  confirmDelete(): void {
    const supplier = this.supplierToDelete();
    if (!supplier?.id) return;

    this.deleting.set(true);
    this.suppliersApi.delete(supplier.id).subscribe({
      next: () => {
        this.toast.success('Fournisseur supprimé');
        this.showDeleteDialog.set(false);
        this.deleting.set(false);
        this.loadSuppliers();
      },
      error: () => this.deleting.set(false)
    });
  }
}
