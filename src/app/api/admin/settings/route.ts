// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read settings from a JSON file or database
    const settingsPath = join(process.cwd(), 'data', 'settings.json')
    
    try {
      const settingsData = await readFile(settingsPath, 'utf8')
      const settings = JSON.parse(settingsData)
      return NextResponse.json(settings)
    } catch (error) {
      // Return default settings if file doesn't exist
      const defaultSettings = {
        siteName: process.env.SITE_NAME || 'My Ecommerce Store',
        siteDescription: process.env.SITE_DESCRIPTION || '',
        currency: process.env.CURRENCY || 'USD',
        taxRate: parseFloat(process.env.TAX_RATE || '0'),
        shippingRate: parseFloat(process.env.SHIPPING_RATE || '0'),
        freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '0'),
        emailNotifications: true,
        lowStockThreshold: 5,
        allowGuestCheckout: true,
        maintenanceMode: false,
      }
      return NextResponse.json(defaultSettings)
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await request.json()
    
    // Save settings to a JSON file (in production, you'd save to database)
    const settingsPath = join(process.cwd(), 'data', 'settings.json')
    
    // Ensure data directory exists
    try {
      await readFile(join(process.cwd(), 'data'))
    } catch {
      const { mkdir } = await import('fs/promises')
      await mkdir(join(process.cwd(), 'data'), { recursive: true })
    }
    
    await writeFile(settingsPath, JSON.stringify(settings, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}