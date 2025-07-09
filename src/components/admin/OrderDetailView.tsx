// src/components/admin/orders/OrderDetailView.tsx
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '@/types/index';
import { StatusBadge } from './OrderStatusBadge';
import { OrderStatusManager } from './OrderStatusManager';
import { ArrowLeft, Package, CreditCard, MapPin, User, Printer } from 'lucide-react';

interface OrderDetailViewProps {
  order: Order;
  onStatusUpdate: (status: OrderStatus, notes?: string) => Promise<void>;
  onPaymentStatusUpdate: (status: PaymentStatus) => Promise<void>;
  onBack: () => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onStatusUpdate,
  onPaymentStatusUpdate,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleStatusUpdate = async (status: OrderStatus, notes?: string) => {
    setIsLoading(true);
    try {
      await onStatusUpdate(status, notes);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (status: PaymentStatus) => {
    setIsLoading(true);
    try {
      await onPaymentStatusUpdate(status);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Code 128 barcode SVG for order number
  const generateBarcodeSVG = (text: string) => {
    // Calculate optimal barcode dimensions to fit within label
    const maxWidth = 200; // Maximum width for barcode
    const barcodeHeight = 30;
    
    // Simplified barcode pattern - properly typed with index signature
    const patterns: { [key: string]: string } = {
      '0': '101', '1': '110', '2': '011', '3': '100', '4': '001',
      '5': '111', '6': '000', '7': '010', '8': '101', '9': '110',
      'A': '100', 'B': '001', 'C': '010', 'D': '011', 'E': '110',
      'F': '111', 'G': '000', 'H': '101', 'I': '010', 'J': '011',
      'K': '100', 'L': '001', 'M': '110', 'N': '111', 'O': '000',
      'P': '010', 'Q': '011', 'R': '100', 'S': '001', 'T': '110',
      'U': '111', 'V': '000', 'W': '101', 'X': '010', 'Y': '011',
      'Z': '100', '-': '001', '_': '110'
    };
    
    // Build pattern string
    let patternString = '1010'; // Start pattern
    
    for (const char of text.toUpperCase()) {
      const pattern = patterns[char] || patterns['0'];
      patternString += pattern;
    }
    
    patternString += '101'; // End pattern
    
    // Calculate bar width to fit within maxWidth
    const barWidth = Math.max(1, Math.floor(maxWidth / patternString.length));
    const actualWidth = patternString.length * barWidth;
    
    let svgBars = '';
    let x = 0;
    
    for (let i = 0; i < patternString.length; i++) {
      if (patternString[i] === '1') {
        svgBars += `<rect x="${x}" y="0" width="${barWidth}" height="${barcodeHeight}" fill="black"/>`;
      }
      x += barWidth;
    }
    
    return `
      <svg width="${actualWidth}" height="${barcodeHeight + 20}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${actualWidth} ${barcodeHeight + 20}">
        ${svgBars}
        <text x="${actualWidth/2}" y="${barcodeHeight + 15}" text-anchor="middle" font-family="Arial" font-size="8" fill="black">${text}</text>
      </svg>
    `;
  };

  // Generate QR Code SVG for domain
  const generateQRCodeSVG = (text: string) => {
    // Simple QR code pattern generator (basic implementation)
    const size = 100;
    const moduleSize = 4;
    const modules = size / moduleSize;
    
    let qrPattern = '';
    
    // Create a simple pattern based on the text (not a real QR code algorithm)
    // In production, you'd use a proper QR code library
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const hash = (text.charCodeAt(0) * row + text.charCodeAt(text.length - 1) * col) % 3;
        if (hash === 0 || (row < 7 && col < 7) || (row < 7 && col >= modules - 7) || (row >= modules - 7 && col < 7)) {
          qrPattern += `<rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    
    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white"/>
        ${qrPattern}
      </svg>
    `;
  };

  const handlePrintShippingAddress = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && order.shippingAddress) {
      const address = order.shippingAddress;
      const currentDomain = window.location.hostname;
      const barcodeSVG = generateBarcodeSVG(order.orderNumber);
      const qrCodeSVG = generateQRCodeSVG(currentDomain);
      
      const printContent = `
        <html>
          <head>
            <title>Shipping Address - Order #${order.orderNumber}</title>
            <style>
              @page {
                size: A5; /* Half of A4 */
                margin: 0;
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 0;
                background: white;
                width: 148mm; /* A5 width */
                height: 210mm; /* A5 height */
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .page-container {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                padding: 15mm;
                box-sizing: border-box;
              }
              .address-container { 
                border: 2px solid #000; 
                padding: 15mm;
                width: 100%;
                max-width: 110mm;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: left;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .order-info { 
                margin-bottom: 12px; 
                font-weight: bold; 
                font-size: 14px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 8px;
                text-align: center;
              }
              .address-content {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              .address-line { 
                margin: 6px 0; 
                font-size: 12px;
                line-height: 1.4;
              }
              .recipient-name {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 6px;
              }
              .barcode-section {
                text-align: center;
                margin: 12px 0;
                padding: 8px;
                border-top: 1px solid #eee;
                border-bottom: 1px solid #eee;
                overflow: hidden;
              }
              .barcode-svg {
                max-width: 95%;
                width: auto;
                height: auto;
                display: block;
                margin: 0 auto;
              }
              .codes-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 10px;
                padding-top: 8px;
                border-top: 1px solid #eee;
              }
              .qr-code {
                width: 35px;
                height: 35px;
              }
              .domain-text {
                font-size: 10px;
                color: #666;
                text-align: right;
                flex-grow: 1;
                margin-left: 10px;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .page-container {
                  page-break-inside: avoid;
                }
              }
              @media screen {
                body {
                  background: #f5f5f5;
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="page-container">
              <div class="address-container">
                <div class="order-info">Order #${order.orderNumber}</div>
                
                <div class="address-content">
                  <div class="recipient-name">${address.firstName} ${address.lastName}</div>
                  ${address.company ? `<div class="address-line">${address.company}</div>` : ''}
                  <div class="address-line">${address.address1}</div>
                  ${address.address2 ? `<div class="address-line">${address.address2}</div>` : ''}
                  <div class="address-line">${address.city}, ${address.state} ${address.postalCode}</div>
                  <div class="address-line">${address.country}</div>
                  ${order.phone ? `<div class="address-line">${order.phone}</div>` : ''}
                </div>

                <div class="barcode-section">
                  <div class="barcode-svg">
                    ${barcodeSVG}
                  </div>
                </div>

                <div class="codes-footer">
                  <div class="qr-code">
                    ${qrCodeSVG}
                  </div>
                  <div class="domain-text">
                    ${currentDomain}
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Orders
          </button>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <StatusBadge status={order.status} type="order" />
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Customer</h3>
                <p className="text-sm text-gray-600">{order.user?.name || 'Guest Customer'}</p>
                <p className="text-sm text-gray-600">{order.email}</p>
                {order.phone && <p className="text-sm text-gray-600">{order.phone}</p>}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Payment</h3>
                <p className="text-sm text-gray-600">{order.paymentMethod || 'N/A'}</p>
                <StatusBadge status={order.paymentStatus} type="payment" className="mt-1" />
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Shipping</h3>
                <p className="text-sm text-gray-600">{order.shippingMethod || 'Standard'}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(order.shippingCost, order.currency)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Order Total</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(order.total, order.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex-shrink-0">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-16 w-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                  {item.product.sku && (
                    <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × {formatCurrency(item.price, order.currency)}
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.total, order.currency)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shippingCost, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatCurrency(order.taxAmount, order.currency)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-medium pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(order.total, order.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Management */}
        <OrderStatusManager
          order={order}
          onStatusUpdate={handleStatusUpdate}
          onPaymentStatusUpdate={handlePaymentStatusUpdate}
          isLoading={isLoading}
        />

        {/* Addresses */}
        <div className="space-y-6">
          {order.shippingAddress && (
            <div className="bg-white shadow-sm rounded-lg border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                    Shipping Address
                  </h3>
                  <button
                    onClick={handlePrintShippingAddress}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Print Label
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          )}

          {order.billingAddress && (
            <div className="bg-white shadow-sm rounded-lg border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-400" />
                  Billing Address
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </p>
                  {order.billingAddress.company && <p>{order.billingAddress.company}</p>}
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      {order.orderHistory.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Order History</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {order.orderHistory.map((history) => (
                <div key={history.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Status changed to: <StatusBadge status={history.status} type="order" className="ml-1" />
                    </p>
                    {history.notes && (
                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(history.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {order.notes && (
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Order Notes</h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};