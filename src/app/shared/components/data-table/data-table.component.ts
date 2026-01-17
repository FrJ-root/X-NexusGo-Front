import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Page } from '../../models';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: any) => string;
  template?: string;
}

export interface TableAction {
  icon: string;
  label: string;
  action: string;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  show?: (row: any) => boolean;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              @for (col of columns; track col.key) {
                <th 
                  [style.width]="col.width"
                  [style.text-align]="col.align || 'left'"
                  [class.sortable]="col.sortable"
                  (click)="col.sortable && onSort(col.key)"
                >
                  {{ col.label }}
                  @if (col.sortable) {
                    <span class="sort-icon">
                      @if (sortColumn === col.key) {
                        {{ sortDirection === 'asc' ? '↑' : '↓' }}
                      } @else {
                        ↕
                      }
                    </span>
                  }
                </th>
              }
              @if (actions.length > 0) {
                <th class="actions-col">Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr>
                <td [attr.colspan]="columns.length + (actions.length > 0 ? 1 : 0)" class="loading-cell">
                  <div class="loading-spinner"></div>
                  Chargement...
                </td>
              </tr>
            } @else if (data.length === 0) {
              <tr>
                <td [attr.colspan]="columns.length + (actions.length > 0 ? 1 : 0)" class="empty-cell">
                  {{ emptyMessage }}
                </td>
              </tr>
            } @else {
              @for (row of data; track trackByFn(row)) {
                <tr [class.clickable]="rowClickable" (click)="onRowClick(row)">
                  @for (col of columns; track col.key) {
                    <td [style.text-align]="col.align || 'left'">
                      @if (col.template === 'status') {
                        <span class="status-badge status-{{ getNestedValue(row, col.key)?.toLowerCase() }}">
                          {{ getNestedValue(row, col.key) }}
                        </span>
                      } @else if (col.template === 'boolean') {
                        <span class="boolean-badge" [class.active]="getNestedValue(row, col.key)">
                          {{ getNestedValue(row, col.key) ? 'Oui' : 'Non' }}
                        </span>
                      } @else if (col.template === 'date') {
                        {{ getNestedValue(row, col.key) | date:'dd/MM/yyyy' }}
                      } @else if (col.template === 'datetime') {
                        {{ getNestedValue(row, col.key) | date:'dd/MM/yyyy HH:mm' }}
                      } @else if (col.template === 'currency') {
                        {{ getNestedValue(row, col.key) | number:'1.2-2' }} €
                      } @else if (col.format) {
                        {{ col.format(getNestedValue(row, col.key), row) }}
                      } @else {
                        {{ getNestedValue(row, col.key) }}
                      }
                    </td>
                  }
                  @if (actions.length > 0) {
                    <td class="actions-cell">
                      @for (action of actions; track action.action) {
                        @if (!action.show || action.show(row)) {
                          <button 
                            class="action-btn action-{{ action.variant || 'primary' }}"
                            [title]="action.label"
                            (click)="onAction(action.action, row, $event)"
                          >
                            {{ action.icon }}
                          </button>
                        }
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      @if (showPagination && totalPages > 1) {
        <div class="pagination">
          <div class="pagination-info">
            Affichage {{ startIndex + 1 }} - {{ endIndex }} sur {{ totalElements }}
          </div>
          <div class="pagination-controls">
            <button 
              class="page-btn" 
              [disabled]="currentPage === 0"
              (click)="onPageChange(0)"
            >
              ««
            </button>
            <button 
              class="page-btn" 
              [disabled]="currentPage === 0"
              (click)="onPageChange(currentPage - 1)"
            >
              «
            </button>
            
            @for (page of visiblePages; track page) {
              <button 
                class="page-btn"
                [class.active]="page === currentPage"
                (click)="onPageChange(page)"
              >
                {{ page + 1 }}
              </button>
            }

            <button 
              class="page-btn" 
              [disabled]="currentPage === totalPages - 1"
              (click)="onPageChange(currentPage + 1)"
            >
              »
            </button>
            <button 
              class="page-btn" 
              [disabled]="currentPage === totalPages - 1"
              (click)="onPageChange(totalPages - 1)"
            >
              »»
            </button>
          </div>
          <div class="page-size-selector">
            <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange($event)">
              @for (size of pageSizeOptions; track size) {
                <option [value]="size">{{ size }} / page</option>
              }
            </select>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: #f9fafb;
      padding: 0.875rem 1rem;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
    }

    .data-table th.sortable:hover {
      background: #f3f4f6;
    }

    .sort-icon {
      margin-left: 0.5rem;
      opacity: 0.5;
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
      font-size: 0.875rem;
    }

    .data-table tbody tr:hover {
      background: #f9fafb;
    }

    .data-table tbody tr.clickable {
      cursor: pointer;
    }

    .loading-cell, .empty-cell {
      text-align: center;
      padding: 3rem !important;
      color: #9ca3af;
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-created { background: #e0e7ff; color: #4338ca; }
    .status-reserved { background: #dbeafe; color: #1d4ed8; }
    .status-shipped, .status-in_transit { background: #fef3c7; color: #b45309; }
    .status-delivered { background: #d1fae5; color: #047857; }
    .status-canceled { background: #fee2e2; color: #b91c1c; }
    .status-planned { background: #e0e7ff; color: #4338ca; }
    .status-draft { background: #f3f4f6; color: #4b5563; }
    .status-approved { background: #dbeafe; color: #1d4ed8; }
    .status-partially_received { background: #fef3c7; color: #b45309; }
    .status-received { background: #d1fae5; color: #047857; }
    .status-active { background: #d1fae5; color: #047857; }
    .status-inactive { background: #fee2e2; color: #b91c1c; }
    .status-inbound { background: #d1fae5; color: #047857; }
    .status-outbound { background: #fee2e2; color: #b91c1c; }
    .status-adjustment { background: #fef3c7; color: #b45309; }

    .boolean-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #fee2e2;
      color: #b91c1c;
    }

    .boolean-badge.active {
      background: #d1fae5;
      color: #047857;
    }

    .actions-col {
      width: 120px;
      text-align: center !important;
    }

    .actions-cell {
      text-align: center;
      white-space: nowrap;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin: 0 0.125rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .action-primary { background: #eff6ff; color: #2563eb; }
    .action-primary:hover { background: #dbeafe; }
    .action-danger { background: #fef2f2; color: #dc2626; }
    .action-danger:hover { background: #fee2e2; }
    .action-warning { background: #fffbeb; color: #d97706; }
    .action-warning:hover { background: #fef3c7; }
    .action-success { background: #f0fdf4; color: #16a34a; }
    .action-success:hover { background: #dcfce7; }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .pagination-controls {
      display: flex;
      gap: 0.25rem;
    }

    .page-btn {
      min-width: 36px;
      height: 36px;
      border: 1px solid #e5e7eb;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      color: #374151;
      transition: all 0.2s;
    }

    .page-btn:hover:not(:disabled) {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .page-size-selector select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #374151;
      background: white;
      cursor: pointer;
    }
  `]
})
export class DataTableComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'Aucune donnée à afficher';
  @Input() showPagination: boolean = true;
  @Input() totalElements: number = 0;
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() rowClickable: boolean = false;
  @Input() trackByKey: string = 'id';

  @Output() sort = new EventEmitter<SortEvent>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() rowClick = new EventEmitter<any>();

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    if (this.totalElements === 0 && this.data.length > 0) {
      this.totalElements = this.data.length;
    }
  }

  get startIndex(): number {
    return this.currentPage * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.totalElements);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  trackByFn(row: any): any {
    return row[this.trackByKey] ?? row;
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sort.emit({ column: this.sortColumn, direction: this.sortDirection });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(Number(size));
  }

  onAction(action: string, row: any, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }

  onRowClick(row: any): void {
    if (this.rowClickable) {
      this.rowClick.emit(row);
    }
  }
}
