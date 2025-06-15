// components/admin/DashboardStats.tsx
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Stat {
  name: string
  value: string | number
  change: string
}

interface DashboardStatsProps {
  stats: Stat[]
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-green-600'
    if (change.startsWith('-')) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeIcon = (change: string) => {
    if (change.startsWith('+')) return <TrendingUp className="w-4 h-4" />
    if (change.startsWith('-')) return <TrendingDown className="w-4 h-4" />
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </dd>
              </div>
            </div>
            <div className={`mt-2 flex items-center text-sm ${getChangeColor(stat.change)}`}>
              {getChangeIcon(stat.change)}
              <span className="ml-1">{stat.change}</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}