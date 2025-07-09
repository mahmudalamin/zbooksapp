// src/lib/services/order.service.ts
import { prisma } from '../db';
import { OrderStatus, PaymentStatus, OrderFilters, Order } from '@/types/index';
import { sendOrderStatusUpdateEmail } from '../email';

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
  pendingPayments: number;
}

export class OrderService {
  static async getOrders(filters?: OrderFilters) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Status filter
    if (filters?.status) {
      where.status = filters.status;
    }

    // Payment status filter
    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    // Search filter
    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    // Date range filter
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, images: true, sku: true }
              }
            }
          },
          shippingAddress: true,
          billingAddress: true,
          orderHistory: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  static async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true, sku: true }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        orderHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  static async updateOrderStatus(id: string, newStatus: OrderStatus, notes?: string) {
    // Get current order first
    const currentOrder = await this.getOrderById(id);
    if (!currentOrder) {
      throw new Error('Order not found');
    }

    const previousStatus = currentOrder.status;

    // Update order status and create history entry
    const [updatedOrder] = await Promise.all([
      prisma.order.update({
        where: { id },
        data: { 
          status: newStatus, 
          updatedAt: new Date() 
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          orderItems: {
            include: {
              product: { select: { name: true, images: true } }
            }
          },
          shippingAddress: true
        }
      }),
      prisma.orderHistory.create({
        data: {
          orderId: id,
          status: newStatus,
          notes,
          createdAt: new Date()
        }
      })
    ]);

    // Send status update email if status actually changed
    if (previousStatus !== newStatus) {
      try {
        await sendOrderStatusUpdateEmail(
          {
            id: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            total: updatedOrder.total,
            status: newStatus,
            paymentStatus: updatedOrder.paymentStatus,
            paymentMethod: updatedOrder.paymentMethod || undefined,
            email: updatedOrder.email,
            customerName: updatedOrder.user?.name,
            orderItems: updatedOrder.orderItems.map(item => ({
              quantity: item.quantity,
              price: item.price,
              product: {
                name: item.product.name,
                images: item.product.images
              }
            })),
            shippingAddress: updatedOrder.shippingAddress ? {
              firstName: updatedOrder.shippingAddress.firstName,
              lastName: updatedOrder.shippingAddress.lastName,
              address1: updatedOrder.shippingAddress.address1,
              address2: updatedOrder.shippingAddress.address2 || undefined,
              city: updatedOrder.shippingAddress.city,
              state: updatedOrder.shippingAddress.state,
              postalCode: updatedOrder.shippingAddress.postalCode,
              country: updatedOrder.shippingAddress.country
            } : undefined,
            user: updatedOrder.user ? {
              name: updatedOrder.user.name || 'Customer',
              email: updatedOrder.user.email
            } : undefined,
            createdAt: updatedOrder.createdAt
          },
          newStatus,
          previousStatus
        );
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't throw error for email failures
      }
    }

    return updatedOrder;
  }

  static async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return await prisma.order.update({
      where: { id },
      data: { 
        paymentStatus, 
        updatedAt: new Date() 
      }
    });
  }

  static async getOrderStats(): Promise<OrderStats> {
    const [
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      refunded,
      revenueData,
      pendingPayments
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
      prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
      prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      prisma.order.count({ where: { status: OrderStatus.REFUNDED } }),
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { total: true }
      }),
      prisma.order.count({ where: { paymentStatus: PaymentStatus.PENDING } })
    ]);

    return {
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      refunded,
      totalRevenue: revenueData._sum.total || 0,
      pendingPayments
    };
  }

  static async getRecentOrders(limit: number = 10) {
    return await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true, sku: true }
            }
          }
        }
      }
    });
  }

  static async bulkUpdateStatus(orderIds: string[], status: OrderStatus, notes?: string) {
    const results = [];
    
    for (const orderId of orderIds) {
      try {
        const result = await this.updateOrderStatus(orderId, status, notes);
        results.push({ orderId, success: true, order: result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ orderId, success: false, error: errorMessage });
      }
    }
    
    return results;
  }
}