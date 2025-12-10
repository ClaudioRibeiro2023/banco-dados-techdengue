'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PDFConfig {
  title: string;
  subtitle?: string;
  periodo?: { inicio: string; fim: string };
  filename?: string;
}

interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
}

interface TableData {
  title?: string;
  columns: TableColumn[];
  rows: Record<string, string | number>[];
}

interface KPIData {
  label: string;
  value: string | number;
  suffix?: string;
}

export function createPDFReport(config: PDFConfig) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text('TechDengue', 14, yPosition);

  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(config.title, 14, yPosition);

  if (config.subtitle) {
    yPosition += 7;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(config.subtitle, 14, yPosition);
  }

  if (config.periodo) {
    yPosition += 7;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const periodoText = `Período: ${format(new Date(config.periodo.inicio), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(config.periodo.fim), 'dd/MM/yyyy', { locale: ptBR })}`;
    doc.text(periodoText, 14, yPosition);
  }

  // Line separator
  yPosition += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPosition, 196, yPosition);
  yPosition += 10;

  return {
    doc,
    yPosition,

    addKPIs(kpis: KPIData[], columnsPerRow = 4) {
      const kpiWidth = (196 - 14) / columnsPerRow;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Indicadores Principais', 14, yPosition);
      yPosition += 8;

      kpis.forEach((kpi, index) => {
        const col = index % columnsPerRow;
        const row = Math.floor(index / columnsPerRow);
        const x = 14 + col * kpiWidth;
        const y = yPosition + row * 20;

        // Box background
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(x, y, kpiWidth - 4, 16, 2, 2, 'F');

        // Value
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        const valueText = `${kpi.value}${kpi.suffix || ''}`;
        doc.text(valueText, x + 4, y + 8);

        // Label
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(kpi.label, x + 4, y + 13);
      });

      const rows = Math.ceil(kpis.length / columnsPerRow);
      yPosition += rows * 20 + 10;
      return this;
    },

    addTable(tableData: TableData) {
      if (tableData.title) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(tableData.title, 14, yPosition);
        yPosition += 6;
      }

      autoTable(doc, {
        startY: yPosition,
        head: [tableData.columns.map(col => col.header)],
        body: tableData.rows.map(row =>
          tableData.columns.map(col => String(row[col.dataKey] ?? ''))
        ),
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        margin: { left: 14, right: 14 },
        columnStyles: tableData.columns.reduce((acc, col, index) => {
          if (col.width) {
            acc[index] = { cellWidth: col.width };
          }
          return acc;
        }, {} as Record<number, { cellWidth: number }>),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      return this;
    },

    addSection(title: string, content: string) {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(title, 14, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 14, yPosition);
      yPosition += lines.length * 5 + 10;
      return this;
    },

    addPageBreak() {
      doc.addPage();
      yPosition = 20;
      return this;
    },

    addFooter() {
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
          14,
          285
        );
        doc.text(`Página ${i} de ${pageCount}`, 180, 285);
      }
      return this;
    },

    save(filename?: string) {
      this.addFooter();
      const name = filename || config.filename || `relatorio-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(name);
    },

    getBlob(): Blob {
      this.addFooter();
      return doc.output('blob');
    },
  };
}
