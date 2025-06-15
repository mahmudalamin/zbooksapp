// types/index.ts
export interface User {
  id: string
  name: string | null
  email: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
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
  shippingAddress?: Address | null
  billingAddress?: Address | null
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

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
export type AddressType = 'SHIPPING' | 'BILLING' | 'BOTH'
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'