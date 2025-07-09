// src/app/admin/orders/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Order, OrderStatus, PaymentStatus } from '@/types/index';
import { OrderDetailView } from '@/components/admin/OrderDetailView';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data);
      } else {
        console.error('Failed to fetch order:', data.error);
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: OrderStatus, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        fetchOrder(); // Refresh order data
      } else {
        const data = await response.json();
        console.error('Failed to update status:', data.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePaymentStatusUpdate = async (paymentStatus: PaymentStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      });

      if (response.ok) {
        fetchOrder(); // Refresh order data
      } else {
        const data = await response.json();
        console.error('Failed to update payment status:', data.error);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleBack = () => {
    router.push('/admin/orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <OrderDetailView
          order={order}
          onStatusUpdate={handleStatusUpdate}
          onPaymentStatusUpdate={handlePaymentStatusUpdate}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
