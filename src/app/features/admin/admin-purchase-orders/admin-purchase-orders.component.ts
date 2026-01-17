import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { PurchaseOrdersApiService, CreatePurchaseOrderRequest, CreatePurchaseOrderLineRequest } from '../../../api/purchase-orders-api.service';
import { SuppliersApiService } from '../../../api/suppliers-api.service';
import { WarehousesApiService } from '../../../api/warehouses-api.service';
import { ProductsApiService } from '../../../api/products-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/services/toast.service';
import { PurchaseOrder, PurchaseOrderStatus, Supplier, Warehouse, Product, PurchaseReceptionBatch, PurchaseOrderLine } from '../../../shared/models';

@Component({
  selector: 'app-admin-purchase-orders',
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
          <h1>Commandes d'achat</h1>
          <p class="subtitle">Gérez les approvisionnements</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          ➕ Nouvelle commande
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
        [data]="purchaseOrders()"
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

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Nouvelle commande d'achat</h2>
              <button class="close-btn" (click)="closeCreateModal()">×</button>
            </div>
            <form [formGroup]="purchaseOrderForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                <div class="form-row">
                  <div class="form-group">
                    <label for="supplierId">Fournisseur *</label>
                    <select id="supplierId" formControlName="supplierId">
                      <option value="">Sélectionner...</option>
                      @for (s of suppliers(); track s.id) {
                        <option [value]="s.id">{{ s.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="warehouseId">Entrepôt *</label>
                    <select id="warehouseId" formControlName="warehouseId">
                      <option value="">Sélectionner...</option>
                      @for (w of warehouses(); track w.id) {
                        <option [value]="w.id">{{ w.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="expectedDeliveryDate">Date de livraison prévue</label>
                  <input type="date" id="expectedDeliveryDate" formControlName="expectedDeliveryDate" />
                </div>

                <h3 class="section-title">Lignes de commande</h3>
                <div class="lines-container" formArrayName="lines">
                  @for (line of lines.controls; track $index; let i = $index) {
                    <div class="line-row" [formGroupName]="i">
                      <div class="form-group">
                        <label>Produit *</label>
                        <select formControlName="productId">
                          <option value="">Sélectionner...</option>
                          @for (p of products(); track p.id) {
                            <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                          }
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Quantité *</label>
                        <input type="number" formControlName="quantity" min="1" />
                      </div>
                      <div class="form-group">
                        <label>Prix unitaire *</label>
                        <input type="number" formControlName="unitPrice" step="0.01" min="0" />
                      </div>
                      <button type="button" class="btn btn-icon btn-danger" (click)="removeLine(i)">🗑️</button>
                    </div>
                  }
                </div>
                <button type="button" class="btn btn-secondary" (click)="addLine()">➕ Ajouter une ligne</button>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeCreateModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="purchaseOrderForm.invalid || saving()">
                  @if (saving()) { <span class="spinner-sm"></span> }
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Detail Modal -->
      @if (showDetailModal()) {
        <div class="modal-overlay" (click)="closeDetailModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Détail PO #{{ selectedOrder()?.id }}</h2>
              <button class="close-btn" (click)="closeDetailModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="detail-grid">
                <div><strong>Fournisseur:</strong> {{ selectedOrder()?.supplierName }}</div>
                <div><strong>Entrepôt:</strong> {{ selectedOrder()?.warehouseName }}</div>
                <div><strong>Statut:</strong> <span class="status-badge status-{{ selectedOrder()?.status?.toLowerCase() }}">{{ selectedOrder()?.status }}</span></div>
                <div><strong>Total:</strong> {{ selectedOrder()?.totalAmount | number:'1.2-2' }} €</div>
              </div>

              <h3 class="section-title">Lignes</h3>
              <table class="lines-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Reçu</th>
                    <th>Prix unit.</th>
                    <th>Total</th>
                    @if (selectedOrder()?.status === 'APPROVED' || selectedOrder()?.status === 'PARTIALLY_RECEIVED') {
                      <th>Réception</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (line of selectedOrder()?.lines; track line.id) {
                    <tr>
                      <td>{{ line.productName }} ({{ line.productSku }})</td>
                      <td>{{ line.quantity }}</td>
                      <td>{{ line.receivedQty || 0 }}</td>
                      <td>{{ line.unitPrice | number:'1.2-2' }} €</td>
                      <td>{{ (line.quantity * (line.unitPrice || 0)) | number:'1.2-2' }} €</td>
                      @if (selectedOrder()?.status === 'APPROVED' || selectedOrder()?.status === 'PARTIALLY_RECEIVED') {
                        <td>
                          <input 
                            type="number" 
                            class="reception-input"
                            [min]="0"
                            [max]="line.quantity - (line.receivedQty || 0)"
                            [(ngModel)]="receptionQtys[line.id!]"
                          />
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>

              @if (selectedOrder()?.status === 'APPROVED' || selectedOrder()?.status === 'PARTIALLY_RECEIVED') {
                <div class="reception-actions">
                  <button class="btn btn-primary" (click)="receivePartial()" [disabled]="receiving()">
                    @if (receiving()) { <span class="spinner-sm"></span> }
                    Réceptionner
                  </button>
                  <button class="btn btn-success" (click)="receiveAll()" [disabled]="receiving()">
                    Tout réceptionner
                  </button>
                </div>
              }
            </div>
            <div class="modal-footer">
              @if (selectedOrder()?.status === 'DRAFT') {
                <button class="btn btn-success" (click)="approveOrder()" [disabled]="approving()">
                  @if (approving()) { <span class="spinner-sm"></span> }
                  Approuver
                </button>
              }
              @if (selectedOrder()?.status !== 'RECEIVED' && selectedOrder()?.status !== 'CANCELED') {
                <button class="btn btn-danger" (click)="cancelOrder()" [disabled]="canceling()">
                  @if (canceling()) { <span class="spinner-sm"></span> }
                  Annuler
                </button>
              }
              <button class="btn btn-secondary" (click)="closeDetailModal()">Fermer</button>
            </div>
          </div>
        </div>
      }
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
    .btn-success { background: #10b981; color: white; }
    .btn-success:hover:not(:disabled) { background: #059669; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
    .btn-icon { padding: 0.5rem; min-width: auto; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
    .form-group { margin-bottom: 1rem; flex: 1; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .form-row { display: flex; gap: 1rem; }
    .section-title { font-size: 1rem; font-weight: 600; color: #374151; margin: 1.5rem 0 1rem; }
    .lines-container { margin-bottom: 1rem; }
    .line-row { display: flex; gap: 0.75rem; align-items: flex-end; margin-bottom: 0.75rem; padding: 1rem; background: #f9fafb; border-radius: 8px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .lines-table { width: 100%; border-collapse: collapse; }
    .lines-table th, .lines-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .lines-table th { background: #f9fafb; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
    .reception-input { width: 80px; padding: 0.375rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; }
    .reception-actions { margin-top: 1rem; display: flex; gap: 0.75rem; }
    .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-draft { background: #f3f4f6; color: #4b5563; }
    .status-approved { background: #dbeafe; color: #1d4ed8; }
    .status-partially_received { background: #fef3c7; color: #b45309; }
    .status-received { background: #d1fae5; color: #047857; }
    .status-canceled { background: #fee2e2; color: #b91c1c; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminPurchaseOrdersComponent implements OnInit {
  private purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private suppliersApi = inject(SuppliersApiService);
  private warehousesApi = inject(WarehousesApiService);
  private productsApi = inject(ProductsApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  purchaseOrders = signal<PurchaseOrder[]>([]);
  suppliers = signal<Supplier[]>([]);
  warehouses = signal<Warehouse[]>([]);
  products = signal<Product[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filterValues = signal<Record<string, any>>({});

  showCreateModal = signal(false);
  saving = signal(false);

  showDetailModal = signal(false);
  selectedOrder = signal<PurchaseOrder | null>(null);
  receptionQtys: Record<number, number> = {};
  receiving = signal(false);
  approving = signal(false);
  canceling = signal(false);

  purchaseOrderForm = this.fb.group({
    supplierId: ['', Validators.required],
    warehouseId: ['', Validators.required],
    expectedDeliveryDate: [''],
    lines: this.fb.array([])
  });

  get lines(): FormArray {
    return this.purchaseOrderForm.get('lines') as FormArray;
  }

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'supplierName', label: 'Fournisseur', sortable: true },
    { key: 'warehouseName', label: 'Entrepôt' },
    { key: 'status', label: 'Statut', template: 'status' },
    { key: 'totalAmount', label: 'Total', template: 'currency', align: 'right' },
    { key: 'createdAt', label: 'Créé le', template: 'date', sortable: true }
  ];

  actions: TableAction[] = [
    { icon: '👁️', label: 'Détail', action: 'view', variant: 'primary' }
  ];

  filterFields: FilterField[] = [
    { key: 'status', label: 'Statut', type: 'select', options: [
      { value: 'DRAFT', label: 'Brouillon' },
      { value: 'APPROVED', label: 'Approuvé' },
      { value: 'PARTIALLY_RECEIVED', label: 'Partiellement reçu' },
      { value: 'RECEIVED', label: 'Reçu' },
      { value: 'CANCELED', label: 'Annulé' }
    ]}
  ];

  ngOnInit(): void {
    this.loadPurchaseOrders();
    this.loadReferenceData();
  }

  loadPurchaseOrders(): void {
    this.loading.set(true);
    this.purchaseOrdersApi.search(this.filterValues(), { page: this.currentPage(), size: this.pageSize() }).subscribe({
      next: (page) => {
        this.purchaseOrders.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadReferenceData(): void {
    this.suppliersApi.getAllActive().subscribe(data => this.suppliers.set(data));
    this.warehousesApi.getAllActive().subscribe(data => this.warehouses.set(data));
    this.productsApi.getActiveProducts({ size: 100 }).subscribe(page => this.products.set(page.content));
  }

  onSearch(filters: Record<string, any>): void {
    this.filterValues.set(filters);
    this.currentPage.set(0);
    this.loadPurchaseOrders();
  }

  onReset(): void {
    this.filterValues.set({});
    this.currentPage.set(0);
    this.loadPurchaseOrders();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPurchaseOrders();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadPurchaseOrders();
  }

  onAction(event: { action: string; row: PurchaseOrder }): void {
    if (event.action === 'view') {
      this.openDetailModal(event.row);
    }
  }

  openCreateModal(): void {
    this.purchaseOrderForm.reset();
    this.lines.clear();
    this.addLine();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  addLine(): void {
    this.lines.push(this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) {
      this.lines.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.purchaseOrderForm.invalid) return;
    this.saving.set(true);

    const formValue = this.purchaseOrderForm.value;
    const request: CreatePurchaseOrderRequest = {
      supplierId: Number(formValue.supplierId),
      warehouseId: Number(formValue.warehouseId),
      expectedDeliveryDate: formValue.expectedDeliveryDate || undefined,
      lines: formValue.lines!.map((l: any) => ({
        productId: Number(l.productId),
        quantity: l.quantity,
        unitPrice: l.unitPrice
      }))
    };

    this.purchaseOrdersApi.create(request).subscribe({
      next: () => {
        this.toast.success('Commande créée');
        this.closeCreateModal();
        this.loadPurchaseOrders();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  openDetailModal(order: PurchaseOrder): void {
    this.purchaseOrdersApi.getById(order.id!).subscribe({
      next: (data: PurchaseOrder) => {
        this.selectedOrder.set(data);
        this.receptionQtys = {};
        data.lines?.forEach((l: PurchaseOrderLine) => this.receptionQtys[l.id!] = 0);
        this.showDetailModal.set(true);
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
  }

  approveOrder(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;
    this.approving.set(true);

    this.purchaseOrdersApi.approve(order.id).subscribe({
      next: (updated) => {
        this.toast.success('Commande approuvée');
        this.selectedOrder.set(updated);
        this.loadPurchaseOrders();
        this.approving.set(false);
      },
      error: () => this.approving.set(false)
    });
  }

  cancelOrder(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;
    this.canceling.set(true);

    this.purchaseOrdersApi.cancel(order.id).subscribe({
      next: () => {
        this.toast.success('Commande annulée');
        this.closeDetailModal();
        this.loadPurchaseOrders();
        this.canceling.set(false);
      },
      error: () => this.canceling.set(false)
    });
  }

  receivePartial(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;

    const items = Object.entries(this.receptionQtys)
      .filter(([_, qty]) => qty > 0)
      .map(([lineId, qty]) => ({ lineId: Number(lineId), receivedQty: qty }));

    if (items.length === 0) {
      this.toast.warning('Aucune quantité à réceptionner');
      return;
    }

    this.receiving.set(true);
    this.purchaseOrdersApi.receive(order.id, { items }).subscribe({
      next: (updated: PurchaseOrder) => {
        this.toast.success('Réception enregistrée');
        this.selectedOrder.set(updated);
        this.receptionQtys = {};
        updated.lines?.forEach((l: PurchaseOrderLine) => this.receptionQtys[l.id!] = 0);
        this.loadPurchaseOrders();
        this.receiving.set(false);
      },
      error: () => this.receiving.set(false)
    });
  }

  receiveAll(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;
    this.receiving.set(true);

    this.purchaseOrdersApi.receiveAll(order.id).subscribe({
      next: (updated) => {
        this.toast.success('Tout réceptionné');
        this.selectedOrder.set(updated);
        this.loadPurchaseOrders();
        this.receiving.set(false);
      },
      error: () => this.receiving.set(false)
    });
  }
}
