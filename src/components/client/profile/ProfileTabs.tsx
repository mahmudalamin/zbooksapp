// components/profile/ProfileTabs.tsx
'use client'

import { useState } from 'react'
import { User, MapPin, ShoppingBag, Settings } from 'lucide-react'
import ProfileInfo from './ProfileInfo'
import AddressBook from './AddressBook'
import OrderHistory from './OrderHistory'
import AccountSettings from './AccountSettings'

interface ProfileTabsProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: Date
  }
  addresses: any[]
  orders: any[]
}

export default function ProfileTabs({ user, addresses, orders }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
      {/* Tab Navigation */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
        <nav className="flex space-x-1 px-6 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-xl font-semibold text-sm flex items-center transition-all duration-300 ease-in-out ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/70 hover:shadow-md hover:scale-102'
              }`}
            >
              <tab.icon className={`w-5 h-5 mr-2 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500'
              }`} />
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-30 -z-10"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-[400px]">
        <div className="animate-fadeIn">
          {activeTab === 'profile' && <ProfileInfo user={user} />}
          {activeTab === 'addresses' && <AddressBook addresses={addresses} />}
          {activeTab === 'orders' && <OrderHistory orders={orders} />}
          {activeTab === 'settings' && <AccountSettings user={user} />}
        </div>
      </div>
    </div>
  )
}