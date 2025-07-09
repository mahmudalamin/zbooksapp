// lib/email.ts
import nodemailer from 'nodemailer'
import { orderConfirmationTemplate, orderStatusUpdateTemplate } from './email-templates'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Order interface to match your database structure
interface OrderForEmail {
  id: string
  orderNumber: string
  total: number
  status: string
  paymentStatus: string
  paymentMethod?: string
  email: string
  customerName?: string | null
  orderItems: Array<{
    quantity: number
    price: number
    product: {
      name: string
      images?: string[]
    }
  }>
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
  user?: { 
    name: string 
    email?: string
  }
  createdAt?: Date
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}

export async function sendOrderConfirmationEmail(order: OrderForEmail) {
  try {
    // Skip sending email if SMTP is not configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log('SMTP not configured, skipping email send for order:', order.orderNumber)
      return { success: false, error: 'SMTP not configured' }
    }

    // Transform order data to match template interface
    const orderData = {
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      orderItems: order.orderItems.map(item => ({
        product: { name: item.product.name },
        quantity: item.quantity,
        price: item.price
      })),
      user: order.user || { 
        name: order.customerName || 
             (order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 'Customer')
      },
      email: order.email,
      shippingAddress: order.shippingAddress
    }

    // Generate email content using template
    const emailHtml = orderConfirmationTemplate(orderData)
    
    // Determine subject based on payment method
    const isPaymentOnDelivery = order.paymentMethod === 'cod'
    const subject = `Order Confirmation - ${order.orderNumber}${isPaymentOnDelivery ? ' (Cash on Delivery)' : ''}`

    // Send the email
    const result = await sendEmail({
      to: order.email,
      subject,
      html: emailHtml,
      text: `Your order ${order.orderNumber} has been confirmed. Total: $${order.total.toFixed(2)}. ${isPaymentOnDelivery ? 'You will pay cash on delivery.' : 'Payment has been processed.'}`
    })

    if (result.success) {
      console.log(`Order confirmation email sent successfully for order: ${order.orderNumber}`)
    } else {
      console.error(`Failed to send order confirmation email for order: ${order.orderNumber}`, result.error)
    }

    return result
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
    // Don't throw the error - we don't want email failures to break order creation
    return { success: false, error }
  }
}

export async function sendOrderStatusUpdateEmail(order: OrderForEmail, newStatus: string, previousStatus?: string) {
  try {
    // Skip sending email if SMTP is not configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log('SMTP not configured, skipping status update email for order:', order.orderNumber)
      return { success: false, error: 'SMTP not configured' }
    }

    // Transform order data to match template interface
    const orderData = {
      orderNumber: order.orderNumber,
      total: order.total,
      status: newStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderItems: order.orderItems.map(item => ({
        product: { name: item.product.name },
        quantity: item.quantity,
        price: item.price
      })),
      user: order.user || { 
        name: order.customerName || 
             (order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 'Customer')
      },
      email: order.email,
      shippingAddress: order.shippingAddress
    }

    // Generate email content using template
    const emailHtml = orderStatusUpdateTemplate(orderData, previousStatus || '')
    
    const subject = `Order Status Update - ${order.orderNumber} (${newStatus})`

    // Send the email
    const result = await sendEmail({
      to: order.email,
      subject,
      html: emailHtml,
      text: `Your order ${order.orderNumber} status has been updated from ${previousStatus || 'previous status'} to ${newStatus}.`
    })

    if (result.success) {
      console.log(`Order status update email sent successfully for order: ${order.orderNumber}`)
    } else {
      console.error(`Failed to send status update email for order: ${order.orderNumber}`, result.error)
    }

    return result
  } catch (error) {
    console.error('Failed to send order status update email:', error)
    return { success: false, error }
  }
}