// lib/notifications.ts
import { sendEmail, orderConfirmationTemplate, orderStatusUpdateTemplate, lowStockAlertTemplate } from './email-templates'
import { prisma } from './db'

export class NotificationService {
  static async sendOrderConfirmation(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: { select: { name: true } },
          orderItems: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      const emailHtml = orderConfirmationTemplate(order)
      
      await sendEmail({
        to: order.email,
        subject: `Order Confirmation - #${order.orderNumber}`,
        html: emailHtml,
        text: `Thank you for your order #${order.orderNumber}. Total: $${order.total.toFixed(2)}`
      })

      console.log(`Order confirmation sent for order ${order.orderNumber}`)
    } catch (error) {
      console.error('Failed to send order confirmation:', error)
    }
  }

  static async sendOrderStatusUpdate(orderId: string, previousStatus: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: { select: { name: true } }
        }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      const emailHtml = orderStatusUpdateTemplate(order, previousStatus)
      
      await sendEmail({
        to: order.email,
        subject: `Order Status Update - #${order.orderNumber}`,
        html: emailHtml,
        text: `Your order #${order.orderNumber} status has been updated to ${order.status}`
      })

      console.log(`Status update sent for order ${order.orderNumber}`)
    } catch (error) {
      console.error('Failed to send status update:', error)
    }
  }

  static async checkAndSendLowStockAlerts() {
    try {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: {
            lte: prisma.product.fields.lowStockThreshold
          },
          isActive: true
        },
        select: {
          name: true,
          stock: true,
          lowStockThreshold: true
        }
      })

      if (lowStockProducts.length > 0) {
        const emailHtml = lowStockAlertTemplate(lowStockProducts)
        
        // Send to all admin users
        const adminUsers = await prisma.user.findMany({
          where: {
            role: { in: ['ADMIN', 'SUPER_ADMIN'] }
          },
          select: { email: true }
        })

        for (const admin of adminUsers) {
          await sendEmail({
            to: admin.email,
            subject: `Low Stock Alert - ${lowStockProducts.length} products need restocking`,
            html: emailHtml,
            text: `${lowStockProducts.length} products are running low on stock. Please check your admin panel.`
          })
        }

        console.log(`Low stock alerts sent to ${adminUsers.length} admins`)
      }
    } catch (error) {
      console.error('Failed to send low stock alerts:', error)
    }
  }
}

