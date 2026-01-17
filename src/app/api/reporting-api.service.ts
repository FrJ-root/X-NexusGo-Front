import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStats, OrderStatus, Inventory } from '../shared/models';

export interface ReportingFilters {
  startDate?: string;
  endDate?: string;
  warehouseId?: number;
}

export interface DeliveryRateReport {
  totalOrders: number;
  deliveredOrders: number;
  deliveryRate: number;
  averageDeliveryTime?: number;
}

export interface StockReport {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  outages: number;
  lowStockItems: number;
}

export interface OrdersReport {
  totalOrders: number;
  byStatus: Record<OrderStatus, number>;
  totalRevenue: number;
  averageOrderValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reporting`;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`);
  }

  getAdminDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/admin/dashboard`);
  }

  getWarehouseDashboardStats(warehouseId?: number): Observable<DashboardStats> {
    let params = new HttpParams();
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    return this.http.get<DashboardStats>(`${this.baseUrl}/warehouse/dashboard`, { params });
  }

  getClientDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/client/dashboard`);
  }

  getDeliveryRate(filters?: ReportingFilters): Observable<DeliveryRateReport> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    return this.http.get<DeliveryRateReport>(`${this.baseUrl}/delivery-rate`, { params });
  }

  getStockReport(warehouseId?: number): Observable<StockReport> {
    let params = new HttpParams();
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    return this.http.get<StockReport>(`${this.baseUrl}/stock`, { params });
  }

  getOrdersReport(filters?: ReportingFilters): Observable<OrdersReport> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    return this.http.get<OrdersReport>(`${this.baseUrl}/orders`, { params });
  }

  getStockOutages(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.baseUrl}/outages`);
  }

  getOrderCountByStatus(): Observable<Record<OrderStatus, number>> {
    return this.http.get<Record<OrderStatus, number>>(`${this.baseUrl}/orders/by-status`);
  }
  
  getInventoryAlerts(): Observable<InventoryAlert[]> {
    return this.http.get<InventoryAlert[]>(`${this.baseUrl}/inventory-alerts`);
  }

  getOrdersByStatus(): Observable<{status: string, count: number}[]> {
    return this.http.get<{status: string, count: number}[]>(`${this.baseUrl}/orders/by-status-list`);
  }

  getTopProducts(limit: number, startDate?: string, endDate?: string): Observable<TopProduct[]> {
    let params = new HttpParams().set('limit', limit);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<TopProduct[]>(`${this.baseUrl}/top-products`, { params });
  }

  getMovementsByWarehouse(startDate?: string, endDate?: string): Observable<MovementReport[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<MovementReport[]>(`${this.baseUrl}/movements-by-warehouse`, { params });
  }

  getTotalRevenue(startDate?: string, endDate?: string): Observable<number> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<number>(`${this.baseUrl}/total-revenue`, { params });
  }

  getShipmentCount(startDate?: string, endDate?: string): Observable<number> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<number>(`${this.baseUrl}/shipment-count`, { params });
  }

  getPurchaseOrderCount(startDate?: string, endDate?: string): Observable<number> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<number>(`${this.baseUrl}/purchase-order-count`, { params });
  }

  getAverageOrderValue(startDate?: string, endDate?: string): Observable<number> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<number>(`${this.baseUrl}/average-order-value`, { params });
  }
}

export interface InventoryAlert {
  productId: number;
  productName: string;
  productSku: string;
  currentQty: number;
  minQty: number;
  warehouseName: string;
  deficit?: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  productSku: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface MovementReport {
  warehouseId: number;
  warehouseName: string;
  totalInbound: number;
  totalOutbound: number;
  netChange: number;
}
