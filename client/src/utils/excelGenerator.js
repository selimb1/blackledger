import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const COLUMNAS = ['fecha','descripcion','detalle','importe','saldo','tipo_movimiento','fuente','imputacion'];
const HEADERS  = ['Fecha','Descripción','Detalle','Importe','Saldo','Tipo','Fuente','Imputación'];

export function generarExcelTransacciones(transacciones, nombreArchivo) {
  const wb = XLSX.utils.book_new();
  const filas = transacciones.map(t => COLUMNAS.map(col => t[col] ?? ''));
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...filas]);

  ws['!cols'] = [
    { wch: 10 }, { wch: 40 }, { wch: 50 },
    { wch: 14 }, { wch: 14 }, { wch: 10 },
    { wch: 20 }, { wch: 25 },
  ];

  // Formato numérico para importe y saldo
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 1; R <= range.e.r; R++) {
    const cImporte = ws[XLSX.utils.encode_cell({ r: R, c: 3 })];
    const cSaldo   = ws[XLSX.utils.encode_cell({ r: R, c: 4 })];
    if (cImporte && typeof cImporte.v === 'number') cImporte.z = '#,##0.00;[Red]-#,##0.00';
    if (cSaldo   && typeof cSaldo.v   === 'number') cSaldo.z   = '#,##0.00';
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Extractos');

  const nombreSalida = nombreArchivo.replace(/\.pdf$/i, '') + '_Comprix.xlsx';
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), nombreSalida);
  return nombreSalida;
}
