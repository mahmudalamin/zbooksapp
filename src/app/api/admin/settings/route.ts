// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settingsPath = join(process.cwd(), 'data', 'settings.json')
    
    try {
      const settingsData = await readFile(settingsPath, 'utf8')
      const settings = JSON.parse(settingsData)
      return NextResponse.json(settings)
    } catch (error) {
      console.log('Settings file not found, returning default settings')
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
    
    // Validate settings object
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 })
    }
    
    const dataDir = join(process.cwd(), 'data')
    const settingsPath = join(dataDir, 'settings.json')
    
    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      try {
        await mkdir(dataDir, { recursive: true })
        console.log('Created data directory')
      } catch (mkdirError) {
        console.error('Error creating data directory:', mkdirError)
        return NextResponse.json({ error: 'Failed to create data directory' }, { status: 500 })
      }
    }
    
    // Save settings to JSON file
    try {
      await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8')
      console.log('Settings saved successfully')
      return NextResponse.json({ success: true, message: 'Settings saved successfully' })
    } catch (writeError) {
      console.error('Error writing settings file:', writeError)
      return NextResponse.json({ error: 'Failed to write settings file' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}