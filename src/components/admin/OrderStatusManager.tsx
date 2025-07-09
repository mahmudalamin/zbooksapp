// src/components/admin/orders/OrderStatusManager.tsx
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '@/types/index';
import { StatusBadge } from './OrderStatusBadge';

interface OrderStatusManagerProps {
  order: Order;
  onStatusUpdate: (status: OrderStatus, notes?: string) => Promise<void>;
  onPaymentStatusUpdate: (status: PaymentStatus) => Promise<void>;
  isLoading: boolean;
}

export const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  order,
  onStatusUpdate,
  onPaymentStatusUpdate,
  isLoading
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [statusNotes, setStatusNotes] = useState('');

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: []
    };

    return [currentStatus, ...statusFlow[currentStatus]];
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus !== order.status) {
      await onStatusUpdate(selectedStatus, statusNotes);
      setStatusNotes('');
    }
  };

  const handlePaymentStatusUpdate = async () => {
    if (selectedPaymentStatus !== order.paymentStatus) {
      await onPaymentStatusUpdate(selectedPaymentStatus);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Status Management</h3>
      </div>
      <div className="px-6 py-4 space-y-6">
        {/* Order Status */}
        <div>
          <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Order Status
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <select
                id="orderStatus"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {getNextStatuses(order.status).map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isLoading || selectedStatus === order.status}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
            
            <div>
              <label htmlFor="statusNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="statusNotes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this status change..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <div className="flex items-center space-x-3">
            <select
              id="paymentStatus"
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
            <button
              onClick={handlePaymentStatusUpdate}
              disabled={isLoading || selectedPaymentStatus === order.paymentStatus}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Current Status Display */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
          <div className="flex items-center space-x-3">
            <StatusBadge status={order.status} type="order" />
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>
        </div>
      </div>
    </div>
  );
};