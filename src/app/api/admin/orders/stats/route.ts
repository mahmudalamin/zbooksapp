// src/app/api/admin/orders/stats/route.ts
import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';

export async function GET() {
  try {
    const stats = await OrderService.getOrderStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order stats' },
      { status: 500 }
    );
  }
}