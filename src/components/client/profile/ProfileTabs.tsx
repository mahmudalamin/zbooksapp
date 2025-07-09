// components/profile/ProfileTabs.tsx
'use client'

import { useState } from 'react'
import { MapPin, ShoppingBag, Settings, User } from 'lucide-react'
import AddressBook from './AddressBook'
import OrderHistory from './OrderHistory'
import AccountSettings from './AccountSettings'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
}

interface Address {
  id: string
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  currency: string
  createdAt: Date
  items: any[]
}

interface ProfileTabsProps {
  user: UserProfile
  addresses: Address[]
  orders: Order[]
}

// Mock components for demonstration (remove these when using real components)
const MockProfileInfo = ({ user }: { user: UserProfile }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
        {user.image ? (
          <img src={user.image} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User className="w-8 h-8" />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h1>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-sm text-gray-500">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  </div>
)

const MockAddressBook = ({ addresses }: { addresses: Address[] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Add New Address
      </button>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.length > 0 ? (
        addresses.map((address) => (
          <div key={address.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">
                {address.firstName} {address.lastName}
              </h3>
              {address.isDefault && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Default
                </span>
              )}
            </div>
            {address.company && <p className="text-gray-600">{address.company}</p>}
            <p className="text-gray-600">{address.address1}</p>
            {address.address2 && <p className="text-gray-600">{address.address2}</p>}
            <p className="text-gray-600">
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="text-gray-600">{address.country}</p>
            <div className="flex space-x-2 mt-3">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-2 text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No addresses saved yet</p>
        </div>
      )}
    </div>
  </div>
)

const MockOrderHistory = ({ orders }: { orders: Order[] }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
    <div className="space-y-4">
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${order.total.toFixed(2)} {order.currency}
                </p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </p>
            <div className="flex space-x-2 mt-3">
              <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Track Order</button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No orders yet</p>
        </div>
      )}
    </div>
  </div>
)

const MockAccountSettings = ({ user }: { user: UserProfile }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Profile Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              defaultValue={user.name || ''}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              defaultValue={user.email}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Update Profile
          </button>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Change Password</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Update Password
          </button>
        </div>
      </div>
    </div>
  </div>
)

export default function ProfileTabs({ user, addresses, orders }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('addresses')

  const tabs = [
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  return (
    <div className="bg-white shadow-lg sm:shadow-2xl rounded-lg sm:rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95 border border-gray-100 w-full max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <nav className="flex space-x-0 px-2 sm:px-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 sm:py-6 px-3 sm:px-8 font-semibold text-sm sm:text-base flex items-center transition-all duration-300 group whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-white rounded-t-xl -mb-px border-t-2 border-x-2 border-blue-500 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-t-lg'
              }`}
            >
              <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-transform duration-200 ${
                activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
              }`} />
              <span className="hidden xs:inline sm:inline">{tab.name}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-8 lg:p-12 min-h-[400px] sm:min-h-[600px] bg-gradient-to-br from-white via-slate-50/30 to-gray-50/50">
        <div className="animate-fadeIn w-full max-w-4xl mx-auto">
          {activeTab === 'addresses' && (
            // Use real component when available, otherwise use mock
            typeof AddressBook !== 'undefined' ? (
              <AddressBook addresses={addresses} />
            ) : (
              <MockAddressBook addresses={addresses} />
            )
          )}
          {activeTab === 'orders' && (
            // Use real component when available, otherwise use mock
            typeof OrderHistory !== 'undefined' ? (
              <OrderHistory orders={orders} />
            ) : (
              <MockOrderHistory orders={orders} />
            )
          )}
          {activeTab === 'settings' && (
            // Use real component when available, otherwise use mock
            typeof AccountSettings !== 'undefined' ? (
              <AccountSettings user={user} />
            ) : (
              <MockAccountSettings user={user} />
            )
          )}
        </div>
      </div>
    </div>
  )
}