// lib/email-templates.ts
interface Order {
  orderNumber: string
  total: number
  status: string
  paymentMethod?: string
  paymentStatus?: string
  orderItems: Array<{
    product: { name: string }
    quantity: number
    price: number
  }>
  user?: { name: string }
  email: string
  shippingAddress?: {
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export const orderConfirmationTemplate = (order: Order) => {
  const itemsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.product.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('')

  const isPaymentOnDelivery = order.paymentMethod === 'cod'
  const paymentMessage = isPaymentOnDelivery 
    ? 'You will pay cash when your order is delivered to your address.'
    : 'Your payment has been processed successfully.'

  const shippingAddressHtml = order.shippingAddress ? `
    <div class="shipping-address">
      <h3>Shipping Address</h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0;">
        <p style="margin: 5px 0;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.address1}</p>
        ${order.shippingAddress.address2 ? `<p style="margin: 5px 0;">${order.shippingAddress.address2}</p>` : ''}
        <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
      </div>
    </div>
  ` : ''

  const codNoticeHtml = isPaymentOnDelivery ? `
    <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <h4 style="color: #92400e; margin-top: 0;">💰 Cash on Delivery</h4>
      <p style="color: #92400e; margin: 5px 0;">
        <strong>Amount to pay at delivery: $${order.total.toFixed(2)}</strong>
      </p>
      <p style="color: #92400e; margin: 5px 0;">
        Please have the exact amount ready when your order arrives. Our delivery partner will collect payment at your doorstep.
      </p>
      <p style="color: #92400e; margin-bottom: 0; font-size: 14px;">
        💳 Note: Some delivery partners may also accept card payments or digital payments at delivery.
      </p>
    </div>
  ` : ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 20px; border: 1px solid #e9ecef; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .order-details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f8f9fa; padding: 10px; text-align: left; }
        .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 10px; }
        .payment-method { 
          display: inline-block; 
          background: ${isPaymentOnDelivery ? '#fef3c7' : '#dcfce7'}; 
          color: ${isPaymentOnDelivery ? '#92400e' : '#166534'}; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #2563eb;">✅ Order Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Hi ${order.user?.name || 'Customer'},</p>
          
          <p>Thank you for your order! We've received your order and ${isPaymentOnDelivery ? 'will deliver it to your address' : 'are processing it now'}.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Payment Method:</strong> <span class="payment-method">${isPaymentOnDelivery ? '💰 Cash on Delivery' : '💳 Credit Card'}</span></p>
          </div>

          ${codNoticeHtml}
          
          <h3>Items Ordered</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            Total: $${order.total.toFixed(2)}
          </div>

          ${shippingAddressHtml}
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>💬 Payment:</strong> ${paymentMessage}</p>
            <p style="margin: 5px 0;"><strong>📦 Next Steps:</strong> We'll send you another email when your order ships with tracking information.</p>
          </div>
          
          <p>Thanks for shopping with us!</p>
        </div>
        
        <div class="footer">
          <p style="margin: 0; color: #6b7280;">
            Questions about your order? Reply to this email or contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const orderStatusUpdateTemplate = (order: Order, previousStatus: string) => {
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Your order has been confirmed and is being prepared.'
      case 'PROCESSING':
        return 'Your order is being processed and will ship soon.'
      case 'SHIPPED':
        return 'Great news! Your order has been shipped.'
      case 'DELIVERED':
        return 'Your order has been delivered. We hope you enjoy your purchase!'
      case 'CANCELLED':
        return 'Your order has been cancelled. If you have any questions, please contact us.'
      default:
        return `Your order status has been updated to ${status}.`
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 20px; border: 1px solid #e9ecef; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .status-update { background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #2563eb;">📦 Order Status Update</h1>
        </div>
        
        <div class="content">
          <p>Hi ${order.user?.name || 'Customer'},</p>
          
          <div class="status-update">
            <h3 style="margin-top: 0;">Order #${order.orderNumber}</h3>
            <p><strong>Status changed from:</strong> ${previousStatus} → ${order.status}</p>
            <p>${getStatusMessage(order.status)}</p>
          </div>
          
          <p>You can track your order status anytime by logging into your account.</p>
          
          <p>Thank you for your business!</p>
        </div>
        
        <div class="footer">
          <p style="margin: 0; color: #6b7280;">
            Questions? Reply to this email or contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const lowStockAlertTemplate = (products: Array<{ name: string; stock: number; lowStockThreshold: number }>) => {
  const productsHtml = products
    .map(
      (product) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${product.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #dc2626;">
          ${product.stock}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${product.lowStockThreshold}
        </td>
      </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Low Stock Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #fef2f2; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 20px; border: 1px solid #e9ecef; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f8f9fa; padding: 10px; text-align: left; }
        .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #dc2626;">⚠️ Low Stock Alert</h1>
        </div>
        
        <div class="content">
          <div class="warning">
            <p><strong>Attention:</strong> The following products are running low on stock and need to be restocked soon.</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th style="text-align: center;">Current Stock</th>
                <th style="text-align: center;">Threshold</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>
          
          <p>Please log into your admin panel to update inventory levels or place restock orders.</p>
        </div>
        
        <div class="footer">
          <p style="margin: 0; color: #6b7280;">
            This is an automated alert from your ecommerce system.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}