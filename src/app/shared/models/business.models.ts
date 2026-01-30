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

export enum MovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum PurchaseOrderStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  RECEIVED = 'RECEIVED',
  CANCELED = 'CANCELED'
}

export enum CarrierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// Interfaces matching DTOs
export interface User {
  id: number;
  email: string;
  role: Role;
  active: boolean;
}

export interface Client {
  id: number;
  name: string;
  contactInfo: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  originalPrice: number;
  finalPrice: number;
  active: boolean;
  basePrice?: number; // Backend uses basePrice
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  location?: string;
  capacity?: number;
  active: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  active: boolean;
}

export interface SalesOrderLine {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  salesOrderId?: number;
  product?: Product;
}

export interface SalesOrder {
  id: number;
  clientId: number;
  status: OrderStatus;
  createdAt: string;
  reservedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  lines: SalesOrderLine[];
  totalAmount?: number;
  client?: Client;
}

export interface PurchaseOrderLine {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  purchaseOrderId?: number;
  product?: Product;
  receivedQty?: number;
}

export interface PurchaseOrder {
  id: number;
  supplierId: number;
  status: PurchaseOrderStatus;
  createdAt: string;
  expectedDelivery?: string;
  lines: PurchaseOrderLine[];
  supplier?: Supplier;
}

export interface Inventory {
  id: number;
  warehouseId: number;
  productId: number;
  qtyOnHand: number;
  qtyReserved: number;
  available: number;
}

export interface InventoryMovement {
  id: number;
  type: MovementType;
  quantity: number;
  occurredAt: string;
  referenceDocument?: string;
  description?: string;
  warehouseId: number;
  productId: number;
  productName?: string;
}

export interface Carrier {
  id: number;
  code: string;
  name: string;
  contactEmail: string;
  phone: string;
  maxDailyShipments: number;
  maxCapacity: number;
  cutoffTime: number; // e.g., 15 for 15h
  status: CarrierStatus;
}

export interface Shipment {
  id: number;
  salesOrderId: number;
  trackingNumber: string;
  status: ShipmentStatus;
  plannedDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  carrier?: Carrier;
}
