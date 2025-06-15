// app/api/admin/notifications/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, email } = await request.json()

    let subject = 'Test Email'
    let html = '<h1>Test Email</h1><p>This is a test email from your ecommerce admin panel.</p>'

    switch (type) {
      case 'welcome':
        subject = 'Welcome to Our Store'
        html = `
          <h1>Welcome!</h1>
          <p>Thank you for joining our store. We're excited to have you as a customer.</p>
        `
        break
      case 'order_confirmation':
        subject = 'Order Confirmation - Test'
        html = `
          <h1>Order Confirmation</h1>
          <p>This is a test order confirmation email.</p>
          <p><strong>Order Number:</strong> #TEST-123</p>
        `
        break
      case 'shipping':
        subject = 'Your Order Has Shipped'
        html = `
          <h1>Order Shipped</h1>
          <p>Great news! Your order has been shipped and is on its way.</p>
        `
        break
    }

    const result = await sendEmail({
      to: email || session.user.email,
      subject,
      html,
      text: subject
    })

    if (result.success) {
      return NextResponse.json({ message: 'Test email sent successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}

