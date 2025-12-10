'use client';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface ExcelSheet {
  name: string;
  data: Record<string, unknown>[];
  columns?: { header: string; key: string; width?: number }[];
}

interface ExcelConfig {
  filename: string;
  sheets: ExcelSheet[];
}

export function exportToExcel(config: ExcelConfig) {
  const workbook = XLSX.utils.book_new();

  config.sheets.forEach((sheet) => {
    let sheetData: unknown[][];

    if (sheet.columns) {
      // Create header row
      const headers = sheet.columns.map(col => col.header);

      // Create data rows
      const rows = sheet.data.map(row =>
        sheet.columns!.map(col => row[col.key])
      );

      sheetData = [headers, ...rows];
    } else {
      // Use XLSX default conversion
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    if (sheet.columns) {
      worksheet['!cols'] = sheet.columns.map(col => ({
        wch: col.width || 15,
      }));
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  // Save file
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${config.filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// Utility function for simple single-sheet export
export function exportDataToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName = 'Dados'
) {
  exportToExcel({
    filename,
    sheets: [{ name: sheetName, data }],
  });
}
