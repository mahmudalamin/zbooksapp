// components/profile/AddressBook.tsx
'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, MapPin, Home, Building, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import AddressForm from './AddressForm'

interface AddressBookProps {
  addresses: any[]
}

export default function AddressBook({ addresses: initialAddresses }: AddressBookProps) {
  const [addresses, setAddresses] = useState(initialAddresses)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowForm(true)
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setIsDeleting(addressId)
    try {
      const response = await fetch(`/api/profile/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete address' }))
        throw new Error(errorData.error || 'Failed to delete address')
      }

      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
      toast.success('Address deleted successfully')
    } catch (error: any) {
      console.error('Error deleting address:', error)
      toast.error(error.message || 'Failed to delete address')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  const handleFormSuccess = (savedAddress: any) => {
    if (editingAddress) {
      setAddresses(prev => {
        const updated = prev.map(addr => 
          addr.id === editingAddress.id ? savedAddress : addr
        )
        
        if (savedAddress.isDefault) {
          return updated.map(addr => 
            addr.id !== savedAddress.id 
              ? { ...addr, isDefault: false }
              : addr
          )
        }
        
        return updated
      })
      toast.success('Address updated successfully')
    } else {
      setAddresses(prev => {
        if (savedAddress.isDefault) {
          const updatedPrev = prev.map(addr => ({ ...addr, isDefault: false }))
          return [...updatedPrev, savedAddress]
        }
        return [...prev, savedAddress]
      })
      toast.success('Address added successfully')
    }
    handleFormClose()
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'BILLING':
        return <Building className="w-5 h-5 text-green-600" />
      case 'SHIPPING':
        return <Home className="w-5 h-5 text-blue-600" />
      default:
        return <MapPin className="w-5 h-5 text-purple-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BILLING':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'SHIPPING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200'
    }
  }

  if (showForm) {
    return (
      <AddressForm
        address={editingAddress}
        onSuccess={handleFormSuccess}
        onCancel={handleFormClose}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
            <MapPin className="w-6 h-6 mr-3 text-blue-600" />
            Address Book
          </h3>
          <p className="text-gray-600 mt-1">Manage your shipping and billing addresses</p>
        </div>
        <button
          onClick={handleAddAddress}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <MapPin className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Add your first address to make checkout faster and easier.
          </p>
          <button
            onClick={handleAddAddress}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                address.isDefault ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {address.isDefault && (
                <div className="absolute -top-3 -right-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Default
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {getAddressIcon(address.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {address.firstName} {address.lastName}
                    </h4>
                    {address.company && (
                      <p className="text-sm text-gray-600 font-medium">{address.company}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105"
                    title="Edit address"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={isDeleting === address.id}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    title="Delete address"
                  >
                    {isDeleting === address.id ? (
                      <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-gray-700 mb-4">
                <p className="font-medium">{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p className="text-gray-600">{address.country}</p>
              </div>

              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(address.type)}`}>
                  {address.type.replace('_', ' & ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}