// src/components/admin/orders/OrderStatusBadge.tsx
import React from 'react';
import { OrderStatus, PaymentStatus } from '@/types/index';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
  type: 'order' | 'payment';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, className = '' }) => {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'order') {
      switch (status) {
        case OrderStatus.PENDING:
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case OrderStatus.CONFIRMED:
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case OrderStatus.PROCESSING:
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case OrderStatus.SHIPPED:
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case OrderStatus.DELIVERED:
          return 'bg-green-100 text-green-800 border-green-200';
        case OrderStatus.CANCELLED:
          return 'bg-red-100 text-red-800 border-red-200';
        case OrderStatus.REFUNDED:
          return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      switch (status) {
        case PaymentStatus.PENDING:
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case PaymentStatus.PAID:
          return 'bg-green-100 text-green-800 border-green-200';
        case PaymentStatus.FAILED:
          return 'bg-red-100 text-red-800 border-red-200';
        case PaymentStatus.REFUNDED:
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case PaymentStatus.PARTIALLY_REFUNDED:
          return 'bg-orange-100 text-orange-800 border-orange-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status, type)} ${className}`}>
      {formatStatus(status)}
    </span>
  );
};

