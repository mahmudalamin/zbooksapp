// components/admin/ImportManager.tsx
'use client'

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImportResult {
  success: boolean
  imported: number
  errors: Array<{
    row: number
    message: string
  }>
}

export default function ImportManager() {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importType, setImportType] = useState('products')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please upload a CSV file')
      return false
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return false
    }

    return true
  }

  const processFile = async (file: File) => {
    if (!validateFile(file)) return

    setImporting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', importType)

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast.success(`Successfully imported ${data.imported} records`)
      } else {
        throw new Error(data.error || 'Import failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
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
    if (files.length > 0) {
      const file = files[0]
      processFile(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const downloadTemplate = () => {
    const templates = {
      products: '/templates/products-template.csv',
      categories: '/templates/categories-template.csv',
      customers: '/templates/customers-template.csv',
    }
    
    const link = document.createElement('a')
    link.href = templates[importType as keyof typeof templates]
    link.download = `${importType}-template.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Import Type Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Import Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'products', label: 'Products', description: 'Import product catalog' },
            { value: 'categories', label: 'Categories', description: 'Import product categories' },
            { value: 'customers', label: 'Customers', description: 'Import customer data' },
          ].map((type) => (
            <label
              key={type.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                importType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                value={type.value}
                checked={importType === type.value}
                onChange={(e) => setImportType(e.target.value)}
                className="sr-only"
              />
              <div>
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Template Download */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Download Template</h3>
        <p className="text-gray-600 mb-4">
          Download the CSV template for {importType} to ensure your data is formatted correctly.
        </p>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download {importType} Template
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h3>
        
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {dragActive ? (
            <p className="text-blue-600">Drop your CSV file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop your CSV file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Only CSV files are supported (max 10MB)
              </p>
            </div>
          )}
          {importing && (
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Processing import...</p>
            </div>
          )}
        </div>
      </div>

      {/* Import Results */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Results</h3>
          
          <div className="space-y-4">
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Successfully imported {result.imported} records</span>
            </div>

            {result.errors.length > 0 && (
              <div>
                <div className="flex items-center text-red-600 mb-2">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{result.errors.length} errors encountered</span>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-md p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-1">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 font-mono">
                        <span className="font-bold">Row {error.row}:</span> {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-2">Import Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Total records processed: {result.imported + result.errors.length}</div>
                <div>Successfully imported: {result.imported}</div>
                <div>Failed to import: {result.errors.length}</div>
                <div>Success rate: {Math.round((result.imported / (result.imported + result.errors.length)) * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-blue-900 mb-3">Import Guidelines</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Download and use the provided template for best results</li>
          <li>• Ensure all required fields are filled in</li>
          <li>• Use UTF-8 encoding for special characters</li>
          <li>• Image URLs should be publicly accessible</li>
          <li>• Prices should be numeric values without currency symbols</li>
          <li>• Boolean fields should use 'true' or 'false'</li>
          <li>• Date fields should be in YYYY-MM-DD format</li>
          <li>• Remove any empty rows at the end of your CSV</li>
        </ul>
      </div>

      {/* Processing Status */}
      {importing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
            <span className="text-yellow-700">Processing your import file...</span>
          </div>
          <p className="text-sm text-yellow-600 mt-2">
            Please wait while we validate and import your data. This may take a few moments.
          </p>
        </div>
      )}
    </div>
  )
}