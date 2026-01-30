import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Warehouse } from '../../../shared/models/business.models';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-warehouse-crud',
    standalone: true,
    imports: [CommonModule, DataTableComponent, FormsModule],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Gestion des Entrepôts</h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <span>+ Nouvel Entrepôt</span>
        </button>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="warehouses()"
        (actionClick)="onAction($event)">
      </app-data-table>

      <!-- Create/Edit Modal -->
      <div class="modal" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing() ? 'Modifier' : 'Créer' }} Entrepôt</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Code *</label>
              <input type="text" [(ngModel)]="formData.code" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="formData.name" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Localisation *</label>
              <input type="text" [(ngModel)]="formData.location" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Capacité *</label>
              <input type="number" [(ngModel)]="formData.capacity" class="form-control" required>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Annuler</button>
            <button class="btn btn-primary" (click)="save()">
              {{ isEditing() ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container { padding: 2rem; }
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .btn { 
      padding: 0.5rem 1rem; 
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-outline { background: white; border: 1px solid #e5e7eb; color: #374151; }
    .btn-outline:hover { background: #f9fafb; }
    
    .modal {
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
    .modal-content {
      background: white;
      border-radius: 0.5rem;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-body { padding: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }
    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class WarehouseCrudComponent implements OnInit {
    private warehouseService = inject(WarehouseService);
    private toastService = inject(ToastService);

    warehouses = signal<Warehouse[]>([]);
    showModal = signal(false);
    isEditing = signal(false);
    editingId: number | null = null;

    formData: any = {
        code: '',
        name: '',
        location: '',
        capacity: 0
    };

    columns: TableColumn[] = [
        { key: 'id', label: 'ID' },
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Nom' },
        { key: 'location', label: 'Localisation' },
        { key: 'capacity', label: 'Capacité' },
        { key: 'actions', label: 'Actions', template: 'actions' }
    ];

    ngOnInit() {
        this.loadWarehouses();
    }

    loadWarehouses() {
        this.warehouseService.getAll().subscribe({
            next: (data) => this.warehouses.set(data || []),
            error: () => this.toastService.show('Erreur lors du chargement', 'error')
        });
    }

    openCreateModal() {
        this.formData = { code: '', name: '', location: '', capacity: 0 };
        this.isEditing.set(false);
        this.editingId = null;
        this.showModal.set(true);
    }

    onAction(event: { action: string, row: Warehouse }) {
        if (event.action === 'edit') {
            this.editWarehouse(event.row);
        } else if (event.action === 'delete') {
            this.deleteWarehouse(event.row.id);
        }
    }

    editWarehouse(warehouse: Warehouse) {
        this.formData = { ...warehouse };
        this.isEditing.set(true);
        this.editingId = warehouse.id;
        this.showModal.set(true);
    }

    save() {
        const operation = this.isEditing() && this.editingId
            ? this.warehouseService.update(this.editingId, this.formData)
            : this.warehouseService.create(this.formData);

        operation.subscribe({
            next: () => {
                this.toastService.show(
                    this.isEditing() ? 'Entrepôt mis à jour' : 'Entrepôt créé',
                    'success'
                );
                this.closeModal();
                this.loadWarehouses();
            },
            error: () => this.toastService.show('Erreur lors de la sauvegarde', 'error')
        });
    }

    deleteWarehouse(id: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt?')) {
            this.warehouseService.delete(id).subscribe({
                next: () => {
                    this.toastService.show('Entrepôt supprimé', 'success');
                    this.loadWarehouses();
                },
                error: () => this.toastService.show('Erreur lors de la suppression', 'error')
            });
        }
    }

    closeModal() {
        this.showModal.set(false);
    }
}
