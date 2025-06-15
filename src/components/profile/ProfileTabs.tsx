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
    <div className="bg-white shadow rounded-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && <ProfileInfo user={user} />}
        {activeTab === 'addresses' && <AddressBook addresses={addresses} />}
        {activeTab === 'orders' && <OrderHistory orders={orders} />}
        {activeTab === 'settings' && <AccountSettings user={user} />}
      </div>
    </div>
  )
}

