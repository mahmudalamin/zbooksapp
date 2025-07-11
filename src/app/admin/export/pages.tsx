// app/admin/export/page.tsx
import ExportManager from '@/components/admin/ExportManager'

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Export Data</h1>
      <ExportManager />
    </div>
  )
}
