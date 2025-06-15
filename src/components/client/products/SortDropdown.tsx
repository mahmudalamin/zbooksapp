'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface SortDropdownProps {
  currentSort: string
}

export default function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (newSort: string) => {
    // Create new URLSearchParams from current search params
    const params = new URLSearchParams(searchParams.toString())
    
    // Update the sort parameter
    params.set('sort', newSort)
    
    // Reset to page 1 when sorting changes (good UX practice)
    params.set('page', '1')
    
    // Navigate to the new URL with updated parameters
    router.push(`?${params.toString()}`)
  }

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="newest">Newest First</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name">Name: A to Z</option>
    </select>
  )
}