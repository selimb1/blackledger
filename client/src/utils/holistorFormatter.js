// Mapeo de tipos de comprobante → NOMBRE_COMPROBANTE y TIPO
const MAPA_TIPOS = {
  FACTURA_A:    { nombre: 'FACTURA',      tipo: 'A', cod_mov: 'COMP' },
  FACTURA_B:    { nombre: 'FACTURA',      tipo: 'B', cod_mov: 'COMP' },
  FACTURA_C:    { nombre: 'FACTURA',      tipo: 'C', cod_mov: 'COMP' },
  NOTA_DEBITO_A: { nombre: 'NOTA DEBITO', tipo: 'A', cod_mov: 'ND' },
  NOTA_DEBITO_B: { nombre: 'NOTA DEBITO', tipo: 'B', cod_mov: 'ND' },
  NOTA_CREDITO_A: { nombre: 'NOTA CREDITO', tipo: 'A', cod_mov: 'NC' },
  NOTA_CREDITO_B: { nombre: 'NOTA CREDITO', tipo: 'B', cod_mov: 'NC' },
  TICKET:       { nombre: 'TICKET',       tipo: 'T', cod_mov: 'COMP' },
  RECIBO:       { nombre: 'RECIBO',       tipo: 'X', cod_mov: 'COMP' },
};

// Convierte un número a string con 2 decimales y punto como separador
function formatMonto(n) {
  return (parseFloat(n) || 0).toFixed(2);
}

// Normaliza un campo de texto: mayúsculas, sin pipes, truncado
function formatTexto(s, maxLen = 40) {
  if (!s) return '';
  return s.toString().toUpperCase().replace(/\|/g, '-').substring(0, maxLen).trim();
}

// Formatea el punto de venta con ceros a la izquierda
function formatPV(pv) {
  if (!pv) return '0000';
  return pv.toString().replace(/\D/g, '').padStart(4, '0').substring(0, 4);
}

// Formatea el número de comprobante con ceros a la izquierda
function formatNroComp(nro) {
  if (!nro) return '00000000';
  return nro.toString().replace(/\D/g, '').padStart(8, '0').substring(0, 8);
}

// Genera una línea del .txt para un comprobante
export function comprobanteTxtLine(datos) {
  const mapa = MAPA_TIPOS[datos.tipo_comprobante] || MAPA_TIPOS['TICKET'];

  const campos = [
    formatTexto(mapa.nombre, 15),                    // 1. Nombre comprobante
    mapa.tipo,                                         // 2. Tipo (letra)
    formatPV(datos.punto_de_venta),                   // 3. Punto de venta
    formatNroComp(datos.numero_comprobante),           // 4. Número comprobante
    datos.fecha || '01/01/2025',                      // 5. Fecha DD/MM/YYYY
    datos.condicion_fiscal_emisor || 'CF',            // 6. Cond. fiscal
    (datos.cuit_emisor || '00000000000').replace(/\D/g, '').substring(0, 11) || '00000000000', // 7. CUIT
    formatTexto(datos.razon_social_emisor, 40),       // 8. Razón social
    mapa.cod_mov,                                      // 9. Tipo movimiento
    formatMonto(datos.neto_gravado_21),               // 10. Neto 21%
    formatMonto(datos.neto_gravado_105),              // 11. Neto 10.5%
    formatMonto(datos.no_gravado),                    // 12. No gravado
    formatMonto(datos.exento),                        // 13. Exento
    formatMonto(datos.iva_21),                        // 14. IVA 21%
    formatMonto(datos.iva_105),                       // 15. IVA 10.5%
    formatMonto(datos.total),                         // 16. Total
  ];

  return campos.join('|');
}

// Genera el contenido completo del .txt para todos los comprobantes
export function generarTxtHolistor(comprobantes) {
  const lineas = comprobantes
    .filter(c => c.estado === 'EXTRAIDO' && c.habilitado !== false)
    .map(c => comprobanteTxtLine(c.datos));

  return lineas.join('\r\n'); // CRLF para compatibilidad Windows/Holistor
}

// Genera el nombre del archivo sugerido
export function nombreArchivo(periodo) {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0].replace(/-/g, '');
  return `Comprix_Holistor_${periodo || fecha}.txt`;
}

// Muestra un preview legible del archivo (primeras 5 líneas)
export function previewTxt(comprobantes, maxLineas = 5) {
  const lineas = comprobantes
    .filter(c => c.estado === 'EXTRAIDO' && c.habilitado !== false)
    .slice(0, maxLineas)
    .map(c => comprobanteTxtLine(c.datos));

  return lineas.join('\n');
}
