'use client'

import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface BulkImportProps {
  categories: Array<{ id: string; name: string }>
  onClose: () => void
}

interface ParsedProduct {
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  sku?: string
  stock: number
  categoryName?: string
  isActive: boolean
  isFeatured: boolean
  errors?: string[]
}

export default function BulkProductImport({ categories, onClose }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload')
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  })

  const downloadTemplate = () => {
    const template = `name,slug,description,price,comparePrice,sku,stock,categoryName,isActive,isFeatured
Sample Product 1,sample-product-1,This is a sample product description,29.99,39.99,SKU-001,100,Electronics,true,false
Sample Product 2,sample-product-2,Another sample product,19.99,,SKU-002,50,Clothing,true,true`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const parseCSV = (csvText: string): ParsedProduct[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) throw new Error('CSV must contain at least a header and one data row')

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const products: ParsedProduct[] = []

    const requiredFields = ['name', 'price', 'stock']
    const categoryNames = categories.map(c => c.name.toLowerCase())

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length !== headers.length) continue

      const product: any = {}
      const errors: string[] = []

      headers.forEach((header, index) => {
        const value = values[index]
        
        switch (header.toLowerCase()) {
          case 'name':
            product.name = value
            if (!value) errors.push('Name is required')
            break
          case 'slug':
            product.slug = value || generateSlug(product.name || '')
            break
          case 'description':
            product.description = value || undefined
            break
          case 'price':
            const price = parseFloat(value)
            if (isNaN(price) || price < 0) {
              errors.push('Price must be a valid positive number')
            } else {
              product.price = price
            }
            break
          case 'compareprice':
            const comparePrice = value ? parseFloat(value) : undefined
            if (value && (isNaN(comparePrice!) || comparePrice! < 0)) {
              errors.push('Compare price must be a valid positive number')
            } else {
              product.comparePrice = comparePrice
            }
            break
          case 'sku':
            product.sku = value || undefined
            break
          case 'stock':
            const stock = parseInt(value)
            if (isNaN(stock) || stock < 0) {
              errors.push('Stock must be a valid non-negative number')
            } else {
              product.stock = stock
            }
            break
          case 'categoryname':
            product.categoryName = value
            if (value && !categoryNames.includes(value.toLowerCase())) {
              errors.push(`Category "${value}" not found`)
            }
            break
          case 'isactive':
            product.isActive = value.toLowerCase() === 'true'
            break
          case 'isfeatured':
            product.isFeatured = value.toLowerCase() === 'true'
            break
        }
      })

      // Check required fields
      requiredFields.forEach(field => {
        if (!product[field] && product[field] !== 0) {
          errors.push(`${field} is required`)
        }
      })

      product.errors = errors
      products.push(product)
    }

    return products
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    setIsProcessing(true)

    try {
      const text = await selectedFile.text()
      const products = parseCSV(text)
      setParsedProducts(products)
      setStep('preview')
      toast.success(`Parsed ${products.length} products from CSV`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse CSV')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    const validProducts = parsedProducts.filter(p => !p.errors || p.errors.length === 0)
    
    if (validProducts.length === 0) {
      toast.error('No valid products to import')
      return
    }

    setIsImporting(true)

    try {
      const response = await fetch('/api/admin/products/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          products: validProducts.map(p => ({
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            comparePrice: p.comparePrice,
            sku: p.sku,
            stock: p.stock,
            categoryId: p.categoryName ? categories.find(c => c.name.toLowerCase() === p.categoryName!.toLowerCase())?.id : undefined,
            isActive: p.isActive,
            isFeatured: p.isFeatured
          }))
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportResults({
        success: result.success,
        failed: result.failed,
        errors: result.errors || []
      })

      setStep('complete')
      toast.success(`Successfully imported ${result.success} products`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const validProducts = parsedProducts.filter(p => !p.errors || p.errors.length === 0)
  const invalidProducts = parsedProducts.filter(p => p.errors && p.errors.length > 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Product Import</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">How to import products</h3>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>Download the CSV template</li>
                  <li>Fill in your product data following the template format</li>
                  <li>Upload your completed CSV file</li>
                  <li>Review and confirm the import</li>
                </ol>
              </div>

              {/* Template Download */}
              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </button>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    {isProcessing ? 'Processing...' : 'Upload CSV File'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Select a CSV file containing your product data
                  </p>
                </label>
              </div>

              {/* Required Fields Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Required Fields</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>• name</div>
                  <div>• price</div>
                  <div>• stock</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  If slug is not provided, it will be auto-generated from the product name.
                </p>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Import Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-medium">{validProducts.length}</span>
                    <span className="text-gray-600 ml-1">Valid products</span>
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">{invalidProducts.length}</span>
                    <span className="text-gray-600 ml-1">Invalid products</span>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">{parsedProducts.length}</span>
                    <span className="text-gray-600 ml-1">Total products</span>
                  </div>
                </div>
              </div>

              {/* Invalid Products */}
              {invalidProducts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Products with Errors ({invalidProducts.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {invalidProducts.map((product, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-red-800">{product.name || `Row ${index + 2}`}</div>
                        <ul className="list-disc list-inside text-red-700 ml-2">
                          {product.errors?.map((error, errorIndex) => (
                            <li key={errorIndex}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Products Preview */}
              {validProducts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Valid Products ({validProducts.length})
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Stock</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {validProducts.slice(0, 10).map((product, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{product.stock}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{product.categoryName || 'Uncategorized'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {validProducts.length > 10 && (
                      <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500">
                        ... and {validProducts.length - 10} more products
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Import Complete!</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium text-green-600">{importResults.success}</span> products imported successfully</p>
                  {importResults.failed > 0 && (
                    <p><span className="font-medium text-red-600">{importResults.failed}</span> products failed to import</p>
                  )}
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-red-900 mb-2">Import Errors:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          {step === 'upload' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={validProducts.length === 0 || isImporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : `Import ${validProducts.length} Products`}
              </button>
            </>
          )}

          {step === 'complete' && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}