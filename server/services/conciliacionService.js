const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT_EXTRACTO = `Sos un asistente contable argentino experto en extractos bancarios.
Analizá el siguiente texto de un extracto bancario y extraé TODAS las transacciones en orden cronológico.

REGLAS CRÍTICAS:
- Extraé CADA movimiento individual sin omitir ninguno
- Importes: negativos para débitos/egresos, positivos para créditos/ingresos
- Si hay un "Saldo Inicial", incluilo como primer registro
- El "saldo" es el saldo acumulado DESPUÉS de cada movimiento. Si no podés determinarlo usá null.
- Formato de fecha: DD/MM/YY (dos dígitos para el año)
- Separar "descripcion" (concepto principal) de "detalle" (referencia, número de operación, destinatario)
- tipo_movimiento: exactamente "Credito" o "Debito" (con mayúscula inicial, sin tilde)

Para "imputacion", asigná la cuenta contable más probable:
- Transferencias recibidas / cobros → "Deudores por Ventas"
- Transferencias realizadas / pagos a terceros → "Proveedores"
- Compras con tarjeta de débito → "Proveedores"
- Intereses acreditados → "Intereses cobrados"
- Comisiones y cargos bancarios → "Gastos bancarios"
- Impuestos (IIBB, débitos/créditos bancarios) → "Impuestos y tasas"
- Sueldos y salarios → "Remuneraciones"
- Servicios (luz, gas, telefonía) → "Gastos de servicios"
- Alquileres → "Gastos de alquiler"
- Extracciones de cajero → "Caja"
- Saldo inicial → "Disponibilidades"
- No identificados → "Otras cuentas"

Respondé ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown, sin bloques de código:
[
  {
    "fecha": "DD/MM/YY",
    "descripcion": "descripción principal",
    "detalle": "detalle adicional o referencia",
    "importe": 0.00,
    "saldo": 0.00,
    "tipo_movimiento": "Credito",
    "imputacion": "cuenta contable sugerida"
  }
]`;

/**
 * Extrae JSON de una respuesta que puede tener markdown u otros caracteres extra.
 */
function extraerJSON(texto) {
  // 1. Intentar parsear directo
  try {
    return JSON.parse(texto);
  } catch (_) {}

  // 2. Limpiar bloques de código markdown
  let limpio = texto
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  try {
    return JSON.parse(limpio);
  } catch (_) {}

  // 3. Extraer el primer [ ... ] que aparezca
  const match = limpio.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) {}
  }

  // 4. Extraer primer { ... } y envolverlo en array
  const objMatch = limpio.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return [JSON.parse(objMatch[0])];
    } catch (_) {}
  }

  throw new Error(`No se pudo parsear la respuesta de IA como JSON. Respuesta recibida: ${texto.substring(0, 200)}`);
}

async function extraerTransacciones(pdfBase64, nombreArchivo) {
  const inicio = Date.now();

  // 1. Convertir base64 a Buffer y extraer texto del PDF
  let textoPdf;
  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const parseResult = await pdfParse(pdfBuffer);
    textoPdf = parseResult.text;
    console.log(`[conciliacion] PDF parseado: ${textoPdf?.length ?? 0} caracteres`);
  } catch (pdfError) {
    console.error('[conciliacion] Error al parsear PDF:', pdfError.message);
    throw new Error(`No se pudo leer el PDF: ${pdfError.message}. Verificá que sea un PDF bancario válido y no esté dañado.`);
  }

  if (!textoPdf || textoPdf.trim().length < 50) {
    throw new Error('El PDF no contiene texto extraíble. Puede ser un PDF escaneado o protegido. Intentá con otro archivo.');
  }

  // 2. Enviar el texto extraído a GPT-4o
  let response;
  try {
    response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'Sos un asistente contable argentino experto en extractos bancarios. Respondés únicamente con JSON válido sin markdown.',
        },
        {
          role: 'user',
          content: `${PROMPT_EXTRACTO}\n\n--- EXTRACTO BANCARIO ---\n${textoPdf.substring(0, 15000)}\n--- FIN DEL EXTRACTO ---`,
        },
      ],
    });
  } catch (openaiError) {
    console.error('[conciliacion] Error OpenAI:', openaiError.message);
    throw new Error(`Error al consultar la IA: ${openaiError.message}`);
  }

  const textoRespuesta = response.choices[0]?.message?.content ?? '';
  console.log(`[conciliacion] Respuesta IA (primeros 300 chars): ${textoRespuesta.substring(0, 300)}`);

  // 3. Parsear JSON de la respuesta
  let transacciones;
  try {
    transacciones = extraerJSON(textoRespuesta);
  } catch (parseError) {
    console.error('[conciliacion] Error parseando JSON:', parseError.message);
    throw new Error(parseError.message);
  }

  if (!Array.isArray(transacciones)) {
    throw new Error('La IA no devolvió un listado de transacciones válido.');
  }

  transacciones = transacciones.map(t => ({
    ...t,
    importe: parseFloat(t.importe) || 0,
    saldo: t.saldo !== null && t.saldo !== undefined ? parseFloat(t.saldo) : null,
    fuente: nombreArchivo,
  }));

  console.log(`[conciliacion] Transacciones extraídas: ${transacciones.length} en ${Date.now() - inicio}ms`);

  return {
    transacciones,
    procesado_en_ms: Date.now() - inicio,
    cantidad: transacciones.length,
  };
}

module.exports = { extraerTransacciones };
