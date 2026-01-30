import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../shared/services/toast.service';
import { MovementType, Warehouse, Product } from '../../../shared/models/business.models';

@Component({
    selector: 'app-movement-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="page-container">
      <div class="card form-card">
        <h2>Enregistrer un Mouvement de Stock</h2>
        
        <form [formGroup]="movementForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Type de Mouvement</label>
            <select formControlName="type" class="form-control">
              <option *ngFor="let type of movementTypes" [value]="type">{{ type }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Entrepôt</label>
            <select formControlName="warehouseId" class="form-control">
              <option *ngFor="let wh of warehouses()" [value]="wh.id">{{ wh.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Produit (ID ou SKU)</label>
            <input type="number" formControlName="productId" class="form-control" placeholder="Entrez ID produit">
          </div>

          <div class="form-group">
            <label>Quantité</label>
            <input type="number" formControlName="quantity" class="form-control" placeholder="Ex: 50">
          </div>

          <div class="form-group">
            <label>Référence Document (Optionnel)</label>
            <input type="text" formControlName="referenceDocument" class="form-control" placeholder="Ex: PO-123, SO-456">
          </div>

          <div class="form-actions">
            <button type="button" (click)="onCancel()" class="btn btn-outline">Annuler</button>
            <button type="submit" class="btn btn-primary" [disabled]="movementForm.invalid || isSubmitting()">
              {{ isSubmitting() ? 'Enregistrement...' : 'Confirmer le mouvement' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .page-container { padding: 2rem; display: flex; justify-content: center; }
    .form-card { width: 100%; max-width: 600px; padding: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
  `]
})
export class MovementFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private inventoryService = inject(InventoryService);
    private warehouseService = inject(WarehouseService);
    private toastService = inject(ToastService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    movementForm: FormGroup;
    isSubmitting = signal(false);
    warehouses = signal<Warehouse[]>([]);
    movementTypes = Object.values(MovementType);

    constructor() {
        this.movementForm = this.fb.group({
            type: [MovementType.INBOUND, Validators.required],
            warehouseId: ['', Validators.required],
            productId: ['', Validators.required],
            quantity: ['', [Validators.required, Validators.min(1)]],
            referenceDocument: [''],
            occurredAt: [new Date().toISOString()]
        });
    }

    ngOnInit() {
        this.loadWarehouses();

        // Check if warehouseId is in the route
        const whId = this.route.snapshot.queryParamMap.get('warehouseId');
        if (whId) this.movementForm.patchValue({ warehouseId: Number(whId) });
    }

    loadWarehouses() {
        this.warehouseService.getAll().subscribe(data => this.warehouses.set(data));
    }

    onSubmit() {
        if (this.movementForm.invalid) return;

        this.isSubmitting.set(true);
        const val = this.movementForm.value;
        const obs = val.type === MovementType.INBOUND
            ? this.inventoryService.registerInbound(val)
            : val.type === MovementType.OUTBOUND
                ? this.inventoryService.registerOutbound(val)
                : this.inventoryService.adjustStock(val);

        obs.subscribe({
            next: () => {
                this.toastService.show('Mouvement enregistré !', 'success');
                this.router.navigate(['/warehouse/inventory']);
            },
            error: () => {
                this.toastService.show('Erreur lors de l’enregistrement', 'error');
                this.isSubmitting.set(false);
            }
        });
    }

    onCancel() {
        this.router.navigate(['/warehouse/inventory']);
    }
}
