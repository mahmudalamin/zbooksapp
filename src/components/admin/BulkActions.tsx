'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface BulkActionsProps {
  selectedItems: string[]
  onBulkAction: (action: string) => void
  actions: Array<{
    value: string
    label: string
    dangerous?: boolean
  }>
}

export default function BulkActions({ selectedItems, onBulkAction, actions }: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (selectedItems.length === 0) return null

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Bulk Actions ({selectedItems.length})
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {actions.map(action => (
              <button
                key={action.value}
                onClick={() => {
                  onBulkAction(action.value)
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  action.dangerous ? 'text-red-700 hover:text-red-900' : 'text-gray-700'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}