// src/app/api/admin/orders/bulk-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { OrderStatus } from '@/types/index';

export async function POST(request: NextRequest) {
  try {
    const { orderIds, status, notes } = await request.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs are required' },
        { status: 400 }
      );
    }

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    const results = await OrderService.bulkUpdateStatus(orderIds, status, notes);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error bulk updating orders:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update orders' },
      { status: 500 }
    );
  }
}
