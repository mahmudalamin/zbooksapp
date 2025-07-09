// components/profile/ProfileTabs.tsx
'use client'

import { useState } from 'react'
import { MapPin, ShoppingBag, Settings } from 'lucide-react'
import AddressBook from './AddressBook'
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
  const [activeTab, setActiveTab] = useState('addresses')

  const tabs = [
    { id: 'addresses', name: 'Addresses', icon: MapPin },
       { id: 'settings', name: 'Settings', icon: Settings },
  ]

  return (
    <div className="bg-white shadow-lg sm:shadow-2xl rounded-lg sm:rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95 border border-gray-100 w-full max-w-6xl mx-auto">
      {/* Tab Navigation - Desktop Only */}
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

      {/* Tab Content - Desktop Only */}
      <div className="p-4 sm:p-8 lg:p-12 min-h-[400px] sm:min-h-[600px] bg-gradient-to-br from-white via-slate-50/30 to-gray-50/50">
        <div className="animate-fadeIn w-full max-w-4xl mx-auto">
          {activeTab === 'addresses' && <AddressBook addresses={addresses} />}
        
          {activeTab === 'settings' && <AccountSettings user={user} />}
        </div>
      </div>
    </div>
  )
}