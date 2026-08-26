"use client"

import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExportButtonProps {
  onExportExcel: () => void
  onExportPDF: () => void
  onExportExcelWithDetails?: () => void
  onExportPDFWithDetails?: () => void
  detailsLabel?: string
  disabled?: boolean
}

export function ExportButton({
  onExportExcel,
  onExportPDF,
  onExportExcelWithDetails,
  onExportPDFWithDetails,
  detailsLabel = "com detalhes",
  disabled = false
}: ExportButtonProps) {
  const hasDetails = onExportExcelWithDetails || onExportPDFWithDetails

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          Exportar Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF}>
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          Exportar PDF
        </DropdownMenuItem>
        
        {hasDetails && (
          <>
            <DropdownMenuSeparator />
            {onExportExcelWithDetails && (
              <DropdownMenuItem onClick={onExportExcelWithDetails}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Excel {detailsLabel}
              </DropdownMenuItem>
            )}
            {onExportPDFWithDetails && (
              <DropdownMenuItem onClick={onExportPDFWithDetails}>
                <FileText className="h-4 w-4 mr-2 text-red-600" />
                PDF {detailsLabel}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
