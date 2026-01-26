// Auth Models
export * from './auth.models';

// Enums
export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  RESERVED = 'RESERVED',
  PARTIALLY_RESERVED = 'PARTIALLY_RESERVED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  PLANNED = 'PLANNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}

export enum MovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELED = 'CANCELED'
}

export enum CarrierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// User
export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  contactInfo?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Product
export interface Product {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Warehouse
export interface Warehouse {
  id?: number;
  name: string;
  location?: string;
  capacity?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Inventory
export interface Inventory {
  id?: number;
  productId?: number;
  productSku?: string;
  productName?: string;
  warehouseId?: number;
  warehouseName?: string;
  qtyOnHand: number;
  qtyReserved: number;
  available?: number;
  lastUpdated?: string;
}

// Inventory Movement
export interface InventoryMovement {
  id?: number;
  productId?: number;
  productSku?: string;
  productName?: string;
  warehouseId?: number;
  warehouseName?: string;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  referenceId?: number;
  referenceType?: string;
  createdAt?: string;
  createdBy?: string;
}

// Sales Order
export interface SalesOrder {
  id?: number;
  clientId?: number;
  clientName?: string;
  customerName?: string;
  customerEmail?: string;
  status: OrderStatus;
  totalAmount?: number;
  lines?: SalesOrderLine[];
  backorders?: BackorderLine[];
  createdAt?: string;
  updatedAt?: string;
  reservationExpiresAt?: string;
}

export interface BackorderLine {
  productId: number;
  productName?: string;
  quantityNeeded: number;
  missingQty?: number;
}

export interface SalesOrderLine {
  id?: number;
  productId?: number;
  productSku?: string;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  reservedQty?: number;
  warehouseId?: number;
  warehouseName?: string;
}

// Shipment
export interface Shipment {
  id?: number;
  salesOrderId?: number;
  carrierId?: number;
  carrierName?: string;
  trackingNumber?: string;
  status: ShipmentStatus;
  plannedDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Carrier
export interface Carrier {
  id?: number;
  name: string;
  contactInfo?: string;
  status?: CarrierStatus;
}

// Supplier
export interface Supplier {
  id?: number;
  name: string;
  contactInfo?: string;
  email?: string;
  phone?: string;
  address?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Purchase Order
export interface PurchaseOrder {
  id?: number;
  supplierId?: number;
  supplierName?: string;
  warehouseId?: number;
  warehouseName?: string;
  status: PurchaseOrderStatus;
  totalAmount?: number;
  lines?: PurchaseOrderLine[];
  createdAt?: string;
  updatedAt?: string;
  expectedDeliveryDate?: string;
}

export interface PurchaseOrderLine {
  id?: number;
  productId?: number;
  productSku?: string;
  productName?: string;
  quantity: number;
  receivedQty?: number;
  unitPrice?: number;
}

export interface PurchaseReceptionItem {
  lineId: number;
  receivedQty: number;
}

export interface PurchaseReceptionBatch {
  items: PurchaseReceptionItem[];
}

// Pagination
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

// API Error Response
export interface ApiError {
  timestamp?: string;
  status?: number;
  message?: string;
  error?: string;  // Backend returns { "error": "..." }
  path?: string;
  detail?: string;
  errors?: string[];  // Validation errors array
}

// Dashboard Stats
export interface DashboardStats {
  totalOrders?: number;
  ordersCreated?: number;
  ordersReserved?: number;
  ordersShipped?: number;
  ordersDelivered?: number;
  ordersCanceled?: number;
  totalProducts?: number;
  activeProducts?: number;
  totalWarehouses?: number;
  stockOutages?: number;
  pendingShipments?: number;
  deliveryRate?: number;
}

// Reservation Result
export interface ReservationResult {
  success: boolean;
  fullyReserved: boolean;
  message?: string;
  backorders?: BackorderInfo[];
  allocations?: AllocationInfo[];
}

export interface BackorderInfo {
  productId: number;
  productSku: string;
  requestedQty: number;
  reservedQty: number;
  shortfallQty: number;
}

export interface AllocationInfo {
  warehouseId: number;
  warehouseName: string;
  productId: number;
  allocatedQty: number;
}
