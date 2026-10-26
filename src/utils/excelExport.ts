export interface ExcelColumn<T> {
  header: string;
  key: keyof T | string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date';
  getValue?: (item: T, index: number) => string | number | null | undefined;
}

export interface ExportToExcelOptions<T> {
  fileNamePrefix: string;
  sheetName?: string;
  columns: ExcelColumn<T>[];
  data: T[];
}

function getExportDateString(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
}

export async function exportToExcel<T>({
  fileNamePrefix,
  sheetName = 'Dữ liệu',
  columns,
  data,
}: ExportToExcelOptions<T>): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HomeService';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const allColumns = [
    { header: 'STT', key: '__stt', width: 8 },
    ...columns.map((col) => ({
      header: col.header,
      key: String(col.key),
      width: col.width ?? 20,
    })),
  ];

  worksheet.columns = allColumns;

  const headerRow = worksheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Inter', bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F9B8E' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  data.forEach((item, index) => {
    const rowValues: Record<string, unknown> = {
      __stt: index + 1,
    };

    columns.forEach((col) => {
      let val: unknown;
      if (col.getValue) {
        val = col.getValue(item, index);
      } else {
        val = (item as Record<string, unknown>)[col.key as string];
      }
      rowValues[String(col.key)] = val ?? '';
    });

    const row = worksheet.addRow(rowValues);
    row.height = 22;

    columns.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 2);
      if (col.format === 'currency') {
        cell.numFmt = '#,##0 "đ"';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else if (col.format === 'number') {
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });

    const sttCell = row.getCell(1);
    sttCell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const dateSuffix = getExportDateString();
  const fileName = `${fileNamePrefix}_${dateSuffix}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
