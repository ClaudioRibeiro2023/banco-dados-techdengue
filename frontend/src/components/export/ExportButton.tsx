import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ExportFormat = 'csv' | 'json' | 'parquet'

interface ExportButtonProps {
  endpoint: string
  filename?: string
  disabled?: boolean
  className?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://techdengue-api.railway.app'

export function ExportButton({ 
  endpoint, 
  filename = 'export', 
  disabled = false,
  className = ''
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    setShowMenu(false)

    try {
      const separator = endpoint.includes('?') ? '&' : '?'
      const url = `${API_BASE_URL}${endpoint}${separator}format=${format}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${filename}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Export error:', error)
      alert('Erro ao exportar. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <Button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || isExporting}
        variant="outline"
        aria-haspopup="true"
        aria-expanded={showMenu}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Exportando...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar
          </>
        )}
      </Button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg 
                     border border-gray-200 dark:border-gray-700 z-50"
          role="menu"
          aria-label="Formatos de exportação"
        >
          <div className="py-1">
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              role="menuitem"
            >
              <span className="mr-3">📄</span>
              CSV (Excel)
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              role="menuitem"
            >
              <span className="mr-3">📋</span>
              JSON
            </button>
            <button
              onClick={() => handleExport('parquet')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              role="menuitem"
            >
              <span className="mr-3">🗃️</span>
              Parquet (Big Data)
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default ExportButton
