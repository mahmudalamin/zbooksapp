import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'

type ProductValidationItem = {
  productId: string
  quantity: number
  price: number
  total: number
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Order Creation Started ===')
    
    const session = await getServerSession(authOptions)
    console.log('Session check:', { hasSession: !!session, userId: session?.user?.id })
    
    if (!session?.user?.id) {
      console.error('No valid session found')
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received order data:', {
      itemsCount: body.items?.length,
      paymentMethod: body.paymentMethod,
      total: body.total,
      hasShippingInfo: !!body.shippingInfo
    })
    
    // Extract and validate required fields
    const { 
      items, 
      shippingInfo, 
      subtotal, 
      shipping, 
      tax, 
      total,
      paymentMethod = 'cod',
      paymentStatus = 'pending',
      paymentInfo = null
    } = body

    // Validate cart items
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid cart items:', items)
      return NextResponse.json({ error: 'Cart is empty or invalid' }, { status: 400 })
    }

    // Validate shipping information
    const requiredShippingFields = ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'postalCode']
    const missingShippingFields = requiredShippingFields.filter(field => !shippingInfo?.[field]?.trim())
    
    if (missingShippingFields.length > 0) {
      console.error('Missing shipping fields:', missingShippingFields)
      return NextResponse.json({ 
        error: `Missing required shipping information: ${missingShippingFields.join(', ')}` 
      }, { status: 400 })
    }

    // Validate and verify products
    console.log('Validating products...')
    const productValidation: ProductValidationItem[] = []
    
    for (const [index, item] of items.entries()) {
      const productId = item.productId
      
      if (!productId) {
        console.error(`Missing product ID for item ${index}:`, item)
        return NextResponse.json({ 
          error: `Item ${index + 1} is missing product ID` 
        }, { status: 400 })
      }

      if (!item.quantity || item.quantity <= 0) {
        console.error(`Invalid quantity for item ${index}:`, item.quantity)
        return NextResponse.json({ 
          error: `Item ${index + 1} has invalid quantity` 
        }, { status: 400 })
      }

      if (!item.price || item.price <= 0) {
        console.error(`Invalid price for item ${index}:`, item.price)
        return NextResponse.json({ 
          error: `Item ${index + 1} has invalid price` 
        }, { status: 400 })
      }

      // Check if product exists in database
      console.log(`Checking product ${productId} in database...`)
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        console.error(`Product not found in database: ${productId}`)
        return NextResponse.json({ 
          error: `Product not found: ${productId}. Please refresh your cart.` 
        }, { status: 400 })
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        console.error(`Insufficient stock for product ${productId}: requested ${item.quantity}, available ${product.stock}`)
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}. Only ${product.stock} available.` 
        }, { status: 400 })
      }

      productValidation.push({
        productId: product.id,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.price) * Number(item.quantity)
      })
    }

    console.log('Product validation successful:', productValidation.length, 'items')

    // Generate unique order number
    const orderNumber = `ZB${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Create shipping address
    console.log('Creating shipping address...')
    const shippingAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        firstName: shippingInfo.firstName.trim(),
        lastName: shippingInfo.lastName.trim(),
        company: shippingInfo.company?.trim() || null,
        address1: shippingInfo.address1.trim(),
        address2: shippingInfo.address2?.trim() || null,
        city: shippingInfo.city.trim(),
        state: shippingInfo.state.trim(),
        postalCode: shippingInfo.postalCode.trim(),
        country: shippingInfo.country || 'US',
        isDefault: false,
        type: 'SHIPPING'
      }
    })

    console.log('Shipping address created:', shippingAddress.id)

    // Map payment status to enum values
    let mappedPaymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
    
    switch (paymentStatus?.toLowerCase()) {
      case 'completed':
      case 'paid':
        mappedPaymentStatus = 'PAID'
        break
      case 'failed':
        mappedPaymentStatus = 'FAILED'
        break
      case 'refunded':
        mappedPaymentStatus = 'REFUNDED'
        break
      case 'partially_refunded':
        mappedPaymentStatus = 'PARTIALLY_REFUNDED'
        break
      default:
        mappedPaymentStatus = 'PENDING'
    }

    // Prepare order data
    const orderData = {
      orderNumber,
      userId: session.user.id,
      email: shippingInfo.email.trim(),
      phone: shippingInfo.phone.trim(),
      status: 'PENDING' as const,
      paymentStatus: mappedPaymentStatus,
      paymentMethod: paymentMethod || 'cod',
      shippingMethod: null,
      subtotal: Number(subtotal) || 0,
      shippingCost: Number(shipping) || 0,
      taxAmount: Number(tax) || 0,
      discountAmount: 0,
      total: Number(total) || 0,
      currency: 'USD',
      notes: paymentMethod === 'cod' ? 'Cash on Delivery order' : null,
      shippingAddressId: shippingAddress.id,
      billingAddressId: shippingAddress.id, // Use same address for billing
      orderItems: {
        create: productValidation
      },
      orderHistory: {
        create: {
          status: 'PENDING' as const,
          notes: `Order created with ${(paymentMethod || 'cod').toUpperCase()} payment method`
        }
      }
    }

    console.log('Creating order with payment method:', paymentMethod)

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: orderData,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          shippingAddress: true,
          orderHistory: true
        }
      })

      // Update product stock for each item
      for (const item of productValidation) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return newOrder
    })

    console.log('Order created successfully:', order.orderNumber)

    // Send confirmation email (don't await to avoid blocking)
    if (sendOrderConfirmationEmail) {
      // Transform the order object to match OrderForEmail type
      const orderForEmail = {
        ...order,
        paymentMethod: order.paymentMethod || 'cod',
        shippingAddress: order.shippingAddress ? {
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          address1: order.shippingAddress.address1,
          address2: order.shippingAddress.address2 || undefined,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country
        } : undefined
      }
      
      sendOrderConfirmationEmail(orderForEmail).catch(emailError => {
        console.error('Failed to send confirmation email:', emailError)
      })
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      message: paymentMethod === 'cod' 
        ? 'Order placed successfully! You will pay on delivery.' 
        : 'Order created successfully!'
    }, { status: 201 })

  } catch (error: any) {
    console.error('=== Order Creation Error ===')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error meta:', error.meta)
    console.error('Error stack:', error.stack)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Order number already exists. Please try again.' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid product reference. Please refresh your cart and try again.' },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'One or more products in your cart no longer exist. Please refresh your cart.' },
        { status: 400 }
      )
    }

    // Handle database connection errors
    if (error.code === 'P1001' || error.code === 'P1008') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create order', 
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          meta: error.meta
        } : 'Please try again or contact support if the problem persists.'
      },
      { status: 500 }
    )
  }
}

// GET method remains the same...
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        shippingAddress: true,
        orderHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}