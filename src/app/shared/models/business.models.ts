// Enums matching Backend
export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER'
}

export enum OrderStatus {
  CREATED = 'CREATED',
  RESERVED = 'RESERVED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}

export enum ShipmentStatus {
  PLANNED = 'PLANNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED'
}

// Interfaces matching DTOs
export interface User {
  id: number;
  email: string;
  role: Role;
  active: boolean;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  originalPrice: number;
  finalPrice: number;
  active: boolean;
}

export interface SalesOrderLine {
  id?: number;
  productId: number;
  productName?: string; // Optional helper for UI
  quantity: number;
  unitPrice: number;
}

export interface SalesOrder {
  id: number;
  clientId: number;
  status: OrderStatus;
  createdAt: string; // ISO Date string
  lines: SalesOrderLine[];
  totalAmount?: number; // Helper for UI
}

export interface Inventory {
  id: number;
  warehouseId: number;
  productId: number;
  qtyOnHand: number;
  qtyReserved: number;
  available: number; // Calculated in UI or Backend
}

export interface Shipment {
  id: number;
  trackingNumber: string;
  status: ShipmentStatus;
  plannedDate: string;
}
