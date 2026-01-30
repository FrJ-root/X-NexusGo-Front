import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentService } from '../../../core/services/shipment.service';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ShipmentStatus } from '../../../shared/models/business.models';

@Component({
    selector: 'app-shipment-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="page-container">
      <div class="card form-card">
        <h2>Préparer l'Expédition pour Commande #{{ orderId }}</h2>

        <form [formGroup]="shipmentForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Transporteur</label>
            <input type="text" formControlName="carrierName" class="form-control" placeholder="Ex: DHL, FedEx...">
          </div>

          <div class="form-group">
            <label>Date d'expédition prévue</label>
            <input type="date" formControlName="plannedDate" class="form-control">
          </div>

          <div class="form-group">
            <label>Numéro de Suivi (Généré ou Manuel)</label>
            <input type="text" formControlName="trackingNumber" class="form-control" placeholder="Ex: TRK-999-555">
          </div>

          <div class="form-actions">
            <button type="button" (click)="onCancel()" class="btn btn-outline">Annuler</button>
            <button type="submit" class="btn btn-primary" [disabled]="shipmentForm.invalid || isSubmitting()">
              {{ isSubmitting() ? 'Fulfillment...' : 'Confirmer l’expédition' }}
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
export class ShipmentFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private shipmentService = inject(ShipmentService);
    private toastService = inject(ToastService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    shipmentForm: FormGroup;
    isSubmitting = signal(false);
    orderId?: number;

    constructor() {
        this.shipmentForm = this.fb.group({
            carrierName: ['', Validators.required],
            plannedDate: [new Date().toISOString().split('T')[0], Validators.required],
            trackingNumber: ['TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase(), Validators.required]
        });
    }

    ngOnInit() {
        this.orderId = Number(this.route.snapshot.queryParamMap.get('orderId'));
        if (!this.orderId) {
            this.toastService.show('Aucun ID de commande fourni', 'error');
            this.router.navigate(['/warehouse/orders']);
        }
    }

    onSubmit() {
        if (this.shipmentForm.invalid || !this.orderId) return;

        this.isSubmitting.set(true);
        const val = this.shipmentForm.value;
        const shipmentData = {
            salesOrderId: this.orderId,
            trackingNumber: val.trackingNumber,
            plannedDate: val.plannedDate,
            status: ShipmentStatus.PLANNED
        };

        this.shipmentService.create(shipmentData).subscribe({
            next: () => {
                this.toastService.show('Expédition planifiée ! La commande passera en statut SHIPPED.', 'success');
                this.router.navigate(['/warehouse/dashboard']);
            },
            error: () => {
                this.toastService.show('Erreur lors de la création de l’expédition', 'error');
                this.isSubmitting.set(false);
            }
        });
    }

    onCancel() {
        this.router.navigate(['/warehouse/orders']);
    }
}
