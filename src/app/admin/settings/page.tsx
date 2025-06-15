import SettingsForm from '@/components/admin/SettingsForm'
import { prisma } from '@/lib/db'

export default async function SettingsPage() {
  // You can store settings in a separate table or use environment variables
  const settings = {
    siteName: process.env.SITE_NAME || 'My Ecommerce Store',
    siteDescription: process.env.SITE_DESCRIPTION || '',
    currency: process.env.CURRENCY || 'USD',
    taxRate: parseFloat(process.env.TAX_RATE || '0'),
    shippingRate: parseFloat(process.env.SHIPPING_RATE || '0'),
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '0'),
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  )
}