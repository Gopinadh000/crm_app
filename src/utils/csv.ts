type CsvCell = string | number | boolean | null | undefined

const escapeCsvCell = (value: CsvCell): string => {
  const text = value == null ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * Build a CSV string and trigger a browser download.
 */
export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: CsvCell[][],
) => {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]
  const csvContent = `\uFEFF${lines.join('\n')}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const buildExportFilename = (prefix: string) => {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  return `${prefix}-${stamp}.csv`
}
