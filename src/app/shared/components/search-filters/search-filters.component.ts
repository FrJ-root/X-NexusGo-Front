import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: { value: any; label: string }[];
  placeholder?: string;
}

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container">
      <div class="filters-grid">
        @for (field of fields; track field.key) {
          <div class="filter-field">
            <label [for]="field.key">{{ field.label }}</label>
            @switch (field.type) {
              @case ('text') {
                <input
                  type="text"
                  [id]="field.key"
                  [placeholder]="field.placeholder || ''"
                  [ngModel]="values[field.key]"
                  (ngModelChange)="onValueChange(field.key, $event)"
                />
              }
              @case ('number') {
                <input
                  type="number"
                  [id]="field.key"
                  [placeholder]="field.placeholder || ''"
                  [ngModel]="values[field.key]"
                  (ngModelChange)="onValueChange(field.key, $event)"
                />
              }
              @case ('date') {
                <input
                  type="date"
                  [id]="field.key"
                  [ngModel]="values[field.key]"
                  (ngModelChange)="onValueChange(field.key, $event)"
                />
              }
              @case ('select') {
                <select
                  [id]="field.key"
                  [ngModel]="values[field.key]"
                  (ngModelChange)="onValueChange(field.key, $event)"
                >
                  <option value="">{{ field.placeholder || 'Tous' }}</option>
                  @for (opt of field.options; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              }
              @case ('boolean') {
                <select
                  [id]="field.key"
                  [ngModel]="values[field.key]"
                  (ngModelChange)="onValueChange(field.key, $event)"
                >
                  <option value="">{{ field.placeholder || 'Tous' }}</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              }
            }
          </div>
        }
      </div>
      <div class="filters-actions">
        <button class="btn btn-primary" (click)="onSearch()">
          🔍 Rechercher
        </button>
        <button class="btn btn-secondary" (click)="onReset()">
          ↺ Réinitialiser
        </button>
      </div>
    </div>
  `,
  styles: [`
    .filters-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .filter-field input,
    .filter-field select {
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #374151;
      background: white;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .filter-field input:focus,
    .filter-field select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-field input::placeholder {
      color: #9ca3af;
    }

    .filters-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
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

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }
  `]
})
export class SearchFiltersComponent {
  @Input() fields: FilterField[] = [];
  @Input() values: Record<string, any> = {};

  @Output() search = new EventEmitter<Record<string, any>>();
  @Output() reset = new EventEmitter<void>();
  @Output() valuesChange = new EventEmitter<Record<string, any>>();

  onValueChange(key: string, value: any): void {
    this.values = { ...this.values, [key]: value };
    this.valuesChange.emit(this.values);
  }

  onSearch(): void {
    // Clean empty values
    const cleanValues: Record<string, any> = {};
    for (const [key, value] of Object.entries(this.values)) {
      if (value !== '' && value !== null && value !== undefined) {
        cleanValues[key] = value;
      }
    }
    this.search.emit(cleanValues);
  }

  onReset(): void {
    this.values = {};
    this.valuesChange.emit(this.values);
    this.reset.emit();
  }
}
