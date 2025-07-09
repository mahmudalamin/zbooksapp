// src/app/admin/orders/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderFilters, OrderStatus, PaymentStatus } from '@/types/index';
import { OrderList } from '@/components/admin/OrderList';
import { OrderFiltersComponent } from '@/components/admin/OrderFilters';
import Pagination from '@/components/admin/Pagination';
import { Package, Download, RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (newFilters?: OrderFilters, page?: number) => {
    setLoading(true);
    try {
      const queryFilters = newFilters || filters;
      const queryPage = page || pagination.currentPage;
      
      const searchParams = new URLSearchParams({
        page: queryPage.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(queryFilters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await fetch(`/api/admin/orders?${searchParams}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchOrders(filters, 1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    fetchOrders(clearedFilters, 1);
  };

  const handlePageChange = (page: number) => {
    fetchOrders(filters, page);
  };

  const handleSelectOrder = (orderId: string, selected: boolean) => {
    setSelectedOrders(prev => 
      selected 
        ? [...prev, orderId]
        : prev.filter(id => id !== orderId)
    );
  };

  const handleBulkStatusUpdate = async (status: OrderStatus) => {
    if (selectedOrders.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status,
          notes: `Bulk update to ${status}`
        })
      });

      if (response.ok) {
        setSelectedOrders([]);
        fetchOrders();
      }
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="h-8 w-8 mr-3 text-blue-600" />
                Order Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage and track all customer orders
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchOrders()}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-700">
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkStatusUpdate(OrderStatus.CONFIRMED)}
                    className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark Confirmed
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate(OrderStatus.PROCESSING)}
                    className="px-3 py-1 text-xs font-medium bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Mark Processing
                  </button>
                  <button
                    onClick={() => setSelectedOrders([])}
                    className="px-3 py-1 text-xs font-medium bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <OrderFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <OrderList
              orders={orders}
              onSelectOrder={handleSelectOrder}
              selectedOrders={selectedOrders}
            />

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.pages}
                basePath="/admin/orders"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}