// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const files = data.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 files allowed' }, { status: 400 })
    }

    const uploadedUrls: string[] = []
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    for (const file of files) {
      if (!file.size) continue

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
        }, { status: 400 })
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` 
        }, { status: 400 })
      }

      try {
        // Generate unique filename
        const fileExtension = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExtension}`
        const filePath = join(uploadDir, fileName)

        // Convert file to buffer and write to disk
        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(filePath, buffer)

        // Add URL to results (adjust this based on your domain/CDN setup)
        uploadedUrls.push(`/uploads/products/${fileName}`)
      } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ 
          error: `Failed to upload file: ${file.name}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} files`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to process upload' 
    }, { status: 500 })
  }
}

// For cloud storage (AWS S3, Cloudinary, etc.), replace the file writing logic above with:

/*
// Example for AWS S3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Inside the file loop:
const buffer = Buffer.from(await file.arrayBuffer())
const fileName = `products/${uuidv4()}.${fileExtension}`

const uploadCommand = new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: fileName,
  Body: buffer,
  ContentType: file.type,
  ACL: 'public-read',
})

await s3Client.send(uploadCommand)
uploadedUrls.push(`https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`)
*/

/*
// Example for Cloudinary
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Inside the file loop:
const buffer = Buffer.from(await file.arrayBuffer())
const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

const result = await cloudinary.uploader.upload(base64, {
  folder: 'products',
  resource_type: 'image',
})

uploadedUrls.push(result.secure_url)
*/