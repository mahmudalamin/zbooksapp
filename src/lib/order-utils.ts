// lib/order-utils.ts - Separate utilities file (Alternative approach)
export const orderUtils = {
  generateOrderNumber: () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ORD-${timestamp}-${random}`
  },

  calculateOrderTotal: (
    items: Array<{ price: number; quantity: number }>, 
    shippingCost = 0, 
    taxAmount = 0, 
    discountAmount = 0
  ) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return {
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total: subtotal + shippingCost + taxAmount - discountAmount
    }
  },

  calculateTax: (subtotal: number, taxRate = 0.08) => {
    return subtotal * taxRate
  },

  calculateShipping: (items: Array<{ weight?: number }>, shippingMethod = 'standard') => {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0)
    
    const rates = {
      standard: 5.99,
      express: 12.99,
      overnight: 24.99,
      free: 0
    }
    
    let baseCost = rates[shippingMethod as keyof typeof rates] || rates.standard
    
    // Add weight-based cost
    if (totalWeight > 5) {
      baseCost += (totalWeight - 5) * 2
    }
    
    return baseCost
  },

  getStatusColor: (status: string) => {
    const colors = {
      PENDING: 'yellow',
      CONFIRMED: 'blue', 
      PROCESSING: 'purple',
      SHIPPED: 'indigo',
      DELIVERED: 'green',
      CANCELLED: 'red',
      REFUNDED: 'gray'
    }
    return colors[status as keyof typeof colors] || 'gray'
  },

  getPaymentStatusColor: (status: string) => {
    const colors = {
      PENDING: 'yellow',
      PAID: 'green',
      FAILED: 'red',
      REFUNDED: 'gray',
      PARTIALLY_REFUNDED: 'orange'
    }
    return colors[status as keyof typeof colors] || 'gray'
  },

  getNextStatus: (currentStatus: string) => {
    const statusFlow = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PROCESSING',
      PROCESSING: 'SHIPPED',
      SHIPPED: 'DELIVERED',
      DELIVERED: null,
      CANCELLED: null,
      REFUNDED: null
    }
    return statusFlow[currentStatus as keyof typeof statusFlow]
  },

  validateStatusTransition: (from: string, to: string) => {
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: []
    }
    
    return allowedTransitions[from]?.includes(to) || false
  },

  formatOrderNumber: (orderNumber: string) => {
    return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`
  },

  parseOrderNumber: (orderNumber: string) => {
    return orderNumber.replace('#', '')
  },

  getOrderAge: (createdAt: Date | string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  },

  estimateDeliveryDate: (shippedDate: Date | string, shippingMethod = 'standard') => {
    const shipped = new Date(shippedDate)
    const deliveryDays = {
      standard: 5,
      express: 2,
      overnight: 1,
      free: 7
    }
    
    const days = deliveryDays[shippingMethod as keyof typeof deliveryDays] || 5
    const estimatedDate = new Date(shipped)
    estimatedDate.setDate(estimatedDate.getDate() + days)
    
    return estimatedDate
  }
}

// Export individual functions if needed
export const {
  generateOrderNumber,
  calculateOrderTotal,
  calculateTax,
  calculateShipping,
  getStatusColor,
  getPaymentStatusColor,
  getNextStatus,
  validateStatusTransition,
  formatOrderNumber,
  parseOrderNumber,
  getOrderAge,
  estimateDeliveryDate
} = orderUtils