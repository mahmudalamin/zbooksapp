// src/app/api/admin/orders/[id]/payment-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { PaymentStatus } from '@/types/index';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;  // Await the params Promise to get the id
    const { paymentStatus } = await request.json();

    if (!Object.values(PaymentStatus).includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    const updatedOrder = await OrderService.updatePaymentStatus(
      id,  // Use the destructured id
      paymentStatus as PaymentStatus
    );

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}