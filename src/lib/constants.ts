
// lib/constants.ts
export const ORDER_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed', 
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
} as const

export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially Refunded',
} as const

export const USER_ROLES = {
  USER: 'Customer',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
} as const

export const COUPON_TYPES = {
  PERCENTAGE: 'Percentage',
  FIXED_AMOUNT: 'Fixed Amount',
  FREE_SHIPPING: 'Free Shipping',
} as const

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
]

