// app/api/admin/products/bulk-import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const productImportSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  comparePrice: z.number().optional(),
  sku: z.string().optional(),
  stock: z.number().min(0),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

const bulkImportSchema = z.object({
  products: z.array(productImportSchema)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { products } = bulkImportSchema.parse(body)

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 })
    }

    if (products.length > 1000) {
      return NextResponse.json({ error: 'Maximum 1000 products per import' }, { status: 400 })
    }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Check for duplicate slugs in the import
    const slugs = products.map(p => p.slug)
    const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index)
    if (duplicateSlugs.length > 0) {
      return NextResponse.json({ 
        error: `Duplicate slugs found in import: ${duplicateSlugs.join(', ')}` 
      }, { status: 400 })
    }

    // Check for existing slugs in database
    const existingSlugs = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true }
    })

    if (existingSlugs.length > 0) {
      return NextResponse.json({ 
        error: `Products with these slugs already exist: ${existingSlugs.map(p => p.slug).join(', ')}` 
      }, { status: 400 })
    }

    // Process products in batches to avoid overwhelming the database
    const batchSize = 50
    const batches = []
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      try {
        // Prepare data for batch insert
        const productsToInsert = batch.map(product => ({
          name: product.name,
          slug: product.slug,
          description: product.description || null,
          price: product.price,
          comparePrice: product.comparePrice || null,
          sku: product.sku || null,
          stock: product.stock,
          categoryId: product.categoryId || null,
          images: [],
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        await prisma.product.createMany({
          data: productsToInsert,
          skipDuplicates: true
        })

        successCount += productsToInsert.length
      } catch (error) {
        console.error('Batch import error:', error)
        failedCount += batch.length
        errors.push(`Failed to import batch: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors,
      message: `Successfully imported ${successCount} products${failedCount > 0 ? `, ${failedCount} failed` : ''}`
    })

  } catch (error) {
    console.error('Bulk import error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid data format', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to import products' 
    }, { status: 500 })
  }
}