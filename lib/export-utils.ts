import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ExportColumn {
  header: string
  key: string
  width?: number
}

interface ExportOptions {
  filename: string
  title: string
  subtitle?: string
  columns: ExportColumn[]
  data: Record<string, any>[]
}

// Formatar valor para exibição
function formatValue(value: any): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "boolean") return value ? "Sim" : "Não"
  if (value instanceof Date) {
    return format(value, "dd/MM/yyyy", { locale: ptBR })
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      return format(new Date(value), "dd/MM/yyyy", { locale: ptBR })
    } catch {
      return value
    }
  }
  return String(value)
}

// Exportar para Excel
export function exportToExcel(options: ExportOptions) {
  const { filename, title, columns, data } = options

  // Criar dados para a planilha
  const worksheetData = [
    // Título
    [title],
    // Subtítulo com data de geração
    [`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`],
    // Linha vazia
    [],
    // Cabeçalhos
    columns.map(col => col.header),
    // Dados
    ...data.map(row => columns.map(col => formatValue(row[col.key])))
  ]

  // Criar workbook e worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  
  // Definir larguras das colunas
  worksheet["!cols"] = columns.map(col => ({ wch: col.width || 20 }))
  
  // Mesclar células do título
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } }
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados")
  
  // Gerar arquivo
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  saveAs(blob, `${filename}-${format(new Date(), "yyyy-MM-dd")}.xlsx`)
}

// Exportar para PDF
export function exportToPDF(options: ExportOptions) {
  const { filename, title, subtitle, columns, data } = options

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  })

  // Configurar fonte
  doc.setFont("helvetica")

  // Título
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(title, 14, 15)

  // Subtítulo
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100)
  const subtitleText = subtitle || `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
  doc.text(subtitleText, 14, 22)

  // Tabela
  autoTable(doc, {
    startY: 28,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => formatValue(row[col.key]))),
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    margin: { top: 28 },
  })

  // Rodapé
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Página ${i} de ${pageCount} - SISGAR - Sistema de Gestão Administrativa da Rarotec`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    )
  }

  doc.save(`${filename}-${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

// Exportar múltiplas planilhas (para clientes com órgãos)
export function exportToExcelMultiSheet(
  filename: string,
  sheets: { name: string; title: string; columns: ExportColumn[]; data: Record<string, any>[] }[]
) {
  const workbook = XLSX.utils.book_new()

  sheets.forEach(sheet => {
    const worksheetData = [
      [sheet.title],
      [`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`],
      [],
      sheet.columns.map(col => col.header),
      ...sheet.data.map(row => sheet.columns.map(col => formatValue(row[col.key])))
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    worksheet["!cols"] = sheet.columns.map(col => ({ wch: col.width || 20 }))
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: sheet.columns.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: sheet.columns.length - 1 } }
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.substring(0, 31)) // Excel limita nome da aba a 31 chars
  })

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  saveAs(blob, `${filename}-${format(new Date(), "yyyy-MM-dd")}.xlsx`)
}

// Exportar PDF com múltiplas seções
export function exportToPDFMultiSection(
  filename: string,
  title: string,
  sections: { title: string; columns: ExportColumn[]; data: Record<string, any>[] }[]
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  })

  doc.setFont("helvetica")
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(title, 14, 15)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100)
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 22)

  let startY = 30

  sections.forEach((section, index) => {
    if (index > 0) {
      // Verificar se precisa nova página
      if (startY > doc.internal.pageSize.height - 40) {
        doc.addPage()
        startY = 15
      }
    }

    // Título da seção
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0)
    doc.text(section.title, 14, startY)
    startY += 5

    // Tabela da seção
    autoTable(doc, {
      startY: startY,
      head: [section.columns.map(col => col.header)],
      body: section.data.map(row => section.columns.map(col => formatValue(row[col.key]))),
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didDrawPage: (data) => {
        startY = (data.cursor?.y || 0) + 10
      }
    })

    // Atualizar posição Y para próxima seção
    startY = (doc as any).lastAutoTable.finalY + 15
  })

  // Rodapé
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Página ${i} de ${pageCount} - SISGAR - Sistema de Gestão Administrativa da Rarotec`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    )
  }

  doc.save(`${filename}-${format(new Date(), "yyyy-MM-dd")}.pdf`)
}
