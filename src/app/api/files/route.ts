// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestPath = searchParams.get('path') || '/uploads'
    
    const fullPath = join(process.cwd(), 'public', requestPath)
    
    try {
      const items = await readdir(fullPath)
      const files = await Promise.all(
        items.map(async (item) => {
          const itemPath = join(fullPath, item)
          const stats = await stat(itemPath)
          
          return {
            name: item,
            path: join(requestPath, item),
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.isFile() ? stats.size : undefined,
            modified: stats.mtime,
            url: stats.isFile() ? join(requestPath, item) : undefined,
          }
        })
      )
      
      return NextResponse.json({ files })
    } catch (error) {
      return NextResponse.json({ files: [] })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { path } = await request.json()
    const fullPath = join(process.cwd(), 'public', path)
    
    await unlink(fullPath)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}