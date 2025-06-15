// app/api/admin/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { parse } from 'csv-parse/sync'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const content = await file.text()
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    let imported = 0
    const errors: Array<{ row: number; message: string }> = []

    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const rowNumber = i + 2 // +2 because CSV rows start at 1 and we skip header

      try {
        switch (type) {
          case 'products':
            await importProduct(record)
            break
          case 'categories':
            await importCategory(record)
            break
          case 'customers':
            await importCustomer(record)
            break
          default:
            throw new Error('Unsupported import type')
        }
        imported++
      } catch (error: any) {
        errors.push({
          row: rowNumber,
          message: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}

async function importProduct(record: any) {
  const requiredFields = ['name', 'price']
  for (const field of requiredFields) {
    if (!record[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Generate slug if not provided
  const slug = record.slug || record.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  // Check if product already exists
  const existingProduct = await prisma.product.findUnique({
    where: { slug }
  })

  if (existingProduct) {
    throw new Error(`Product with slug "${slug}" already exists`)
  }

  await prisma.product.create({
    data: {
      name: record.name,
      slug,
      description: record.description || null,
      price: parseFloat(record.price),
      comparePrice: record.comparePrice ? parseFloat(record.comparePrice) : null,
      sku: record.sku || null,
      stock: record.stock ? parseInt(record.stock) : 0,
      lowStockThreshold: record.lowStockThreshold ? parseInt(record.lowStockThreshold) : 5,
      images: record.images ? record.images.split(',').map((url: string) => url.trim()) : [],
      tags: record.tags ? record.tags.split(',').map((tag: string) => tag.trim()) : [],
      isActive: record.isActive ? record.isActive.toLowerCase() === 'true' : true,
      isFeatured: record.isFeatured ? record.isFeatured.toLowerCase() === 'true' : false,
    }
  })
}

async function importCategory(record: any) {
  const requiredFields = ['name']
  for (const field of requiredFields) {
    if (!record[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  const slug = record.slug || record.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const existingCategory = await prisma.category.findUnique({
    where: { slug }
  })

  if (existingCategory) {
    throw new Error(`Category with slug "${slug}" already exists`)
  }

  await prisma.category.create({
    data: {
      name: record.name,
      slug,
      description: record.description || null,
      image: record.image || null,
      isActive: record.isActive ? record.isActive.toLowerCase() === 'true' : true,
    }
  })
}

async function importCustomer(record: any) {
  const requiredFields = ['email']
  for (const field of requiredFields) {
    if (!record[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: record.email }
  })

  if (existingUser) {
    throw new Error(`User with email "${record.email}" already exists`)
  }

  await prisma.user.create({
    data: {
      email: record.email,
      name: record.name || null,
      role: 'USER',
    }
  })
}

