// components/admin/ImageUpload.tsx
'use client'

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, X, Image as ImageIcon, Move } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  maxSize?: number // in MB
}

export default function ImageUpload({ 
  images, 
  onChange, 
  maxImages = 5, 
  maxSize = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = (files: FileList | File[]): File[] => {
    const validFiles: File[] = []
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        continue
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} is too large (max ${maxSize}MB)`)
        continue
      }

      // Check supported formats
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!supportedTypes.includes(file.type)) {
        toast.error(`${file.name} format not supported`)
        continue
      }

      validFiles.push(file)
    }

    return validFiles
  }

  const uploadFiles = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...images, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch (error) {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const validFiles = validateFiles(files)
      if (validFiles.length > 0) {
        uploadFiles(validFiles)
      }
    }
    // Reset input value to allow selecting same file again
    e.target.value = ''
  }

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const validFiles = validateFiles(files)
      if (validFiles.length > 0) {
        uploadFiles(validFiles)
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleImageDragStart = (e: DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleImageDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleImageDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)
    onChange(newImages)
    setDraggedIndex(null)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {dragActive ? (
            <p className="text-blue-600">Drop images here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WEBP up to {maxSize}MB ({maxImages - images.length} remaining)
              </p>
            </div>
          )}
          {uploading && (
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative group"
              draggable
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={handleImageDragOver}
              onDrop={(e) => handleImageDrop(e, index)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent group-hover:border-blue-300 transition-colors">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 p-1 bg-gray-600 bg-opacity-75 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                <Move className="w-4 h-4" />
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Primary Image Indicator */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  Primary
                </div>
              )}
              
              {/* Image Order */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {images.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Image Management</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• First image will be used as the primary product image</p>
            <p>• Drag images to reorder them</p>
            <p>• Click the X to remove an image</p>
            <p>• Hover over images to see management options</p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">Uploading images...</span>
          </div>
        </div>
      )}
    </div>
  )
}