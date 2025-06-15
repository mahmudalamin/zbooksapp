
// components/profile/AddressBook.tsx
'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'
import AddressForm from './AddressForm'

interface AddressBookProps {
  addresses: any[]
}

export default function AddressBook({ addresses: initialAddresses }: AddressBookProps) {
  const [addresses, setAddresses] = useState(initialAddresses)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)

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

    try {
      const response = await fetch(`/api/profile/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete address')

      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  const handleFormSuccess = (newAddress: any) => {
    if (editingAddress) {
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id ? newAddress : addr
      ))
    } else {
      setAddresses(prev => [...prev, newAddress])
    }
    handleFormClose()
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Address Book</h3>
        <button
          onClick={handleAddAddress}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first address to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">
                      {address.firstName} {address.lastName}
                    </h4>
                    {address.isDefault && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {address.company && (
                    <p className="text-sm text-gray-600">{address.company}</p>
                  )}
                  <p className="text-sm text-gray-600">{address.address1}</p>
                  {address.address2 && (
                    <p className="text-sm text-gray-600">{address.address2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}