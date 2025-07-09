// types/index.ts

// Enums - Define these first since they're referenced in interfaces
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum AddressType {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  BOTH = 'BOTH'
}

// Types
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

// Interfaces
export interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  costPrice: number | null
  sku: string | null
  barcode: string | null
  stock: number
  lowStockThreshold: number
  images: string[]
  isActive: boolean
  isFeatured: boolean
  weight: number | null
  dimensions: string | null
  categoryId: string | null
  tags: string[]
  seoTitle: string | null
  seoDescription: string | null
  createdAt: Date
  updatedAt: Date
  category?: Category | null
  _count?: { orderItems: number }
}

export interface Address {
  id: string
  userId: string | null
  firstName: string
  lastName: string
  company: string | null
  address1: string
  address2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  type: AddressType
  createdAt: Date
  updatedAt: Date
}

export interface OrderHistory {
  id: string
  orderId: string
  status: OrderStatus
  notes: string | null
  createdAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  total: number
  product: Product
}

export interface Order {
  id: string
  orderNumber: string
  userId: string | null
  email: string
  phone: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string | null
  shippingMethod: string | null
  subtotal: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  total: number
  currency: string
  notes: string | null
  stripePaymentId: string | null
  createdAt: Date
  updatedAt: Date
  user?: User | null
  orderItems: OrderItem[]
  orderHistory: OrderHistory[]
  shippingAddress?: Address | null
  billingAddress?: Address | null
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
}

export interface OrderFilters {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  search?: string
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
}