const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT_EXTRACCION = `Sos un asistente contable argentino experto en comprobantes fiscales.
Analizá esta imagen de un comprobante y extraé los datos con máxima precisión.

REGLAS CRÍTICAS:
- NUNCA inventes datos. Si no podés leer un campo con certeza, usá null.
- Los montos siempre como número con punto decimal (ej: 8264.46), NUNCA con coma ni puntos de miles.
- La fecha siempre en formato DD/MM/YYYY.
- El CUIT siempre SIN guiones, 11 dígitos (ej: 20271234567). Si no hay CUIT visible: "00000000000".
- La razón social siempre en MAYÚSCULAS y sin caracteres especiales (ñ→N, á→A, etc.).
- Para tickets sin datos del emisor, inferí "TICKET SIN IDENTIFICAR" como razón social.

Determiná el tipo de comprobante:
- Si ves "FACTURA" con letra A/B/C → tipo "FACTURA_A", "FACTURA_B" o "FACTURA_C"
- Si ves "NOTA DE DÉBITO" → tipo "NOTA_DEBITO_A" o "NOTA_DEBITO_B"
- Si ves "NOTA DE CRÉDITO" → tipo "NOTA_CREDITO_A" o "NOTA_CREDITO_B"
- Si ves ticket de caja, ticket fiscal, o similar → tipo "TICKET"
- Si ves "RECIBO" → tipo "RECIBO"

Para la condición fiscal del emisor:
- "RESPONSABLE INSCRIPTO" o emite Factura A → "RI"
- "MONOTRIBUTISTA" o emite Factura C → "M"
- No tiene CUIT o es ticket sin datos → "CF"
- "EXENTO" → "EX"

Respondé ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown:

{
  "tipo_comprobante": "",
  "tipo_letra": "",
  "punto_de_venta": "",
  "numero_comprobante": "",
  "fecha": "",
  "cuit_emisor": "",
  "razon_social_emisor": "",
  "condicion_fiscal_emisor": "",
  "neto_gravado_21": 0.00,
  "neto_gravado_105": 0.00,
  "no_gravado": 0.00,
  "exento": 0.00,
  "iva_21": 0.00,
  "iva_105": 0.00,
  "total": 0.00,
  "confianza": 0.0,
  "advertencias": []
}`;

async function extraerComprobante(imageBase64, mimeType) {
  // GPT-4o Vision no soporta PDF directamente
  if (mimeType === 'application/pdf') {
    throw new Error(
      'OpenAI Vision no soporta PDF. Convertí el PDF a imagen (JPG o PNG) antes de subirlo.'
    );
  }

  const inicio = Date.now();
  let intentos = 0;
  let lastError;

  while (intentos < 3) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: PROMPT_EXTRACCION,
              },
            ],
          },
        ],
      });

      const texto = response.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const datos = JSON.parse(texto);

      // Post-procesamiento y normalización
      datos.razon_social_emisor = normalizarTexto(datos.razon_social_emisor);
      datos.neto_gravado_21  = redondear(datos.neto_gravado_21);
      datos.neto_gravado_105 = redondear(datos.neto_gravado_105);
      datos.no_gravado       = redondear(datos.no_gravado);
      datos.exento           = redondear(datos.exento);
      datos.iva_21           = redondear(datos.iva_21);
      datos.iva_105          = redondear(datos.iva_105);
      datos.total            = redondear(datos.total);
      datos.procesado_en_ms  = Date.now() - inicio;

      // Validación de cierre matemático
      const totalCalculado = redondear(
        datos.neto_gravado_21 + datos.neto_gravado_105 +
        datos.no_gravado + datos.exento +
        datos.iva_21 + datos.iva_105
      );

      if (datos.total > 0 && Math.abs(totalCalculado - datos.total) > 0.10) {
        datos.advertencias.push(
          `El total del comprobante (${datos.total}) no cierra con la suma de componentes (${totalCalculado}). Verificá los montos.`
        );
      }

      return datos;

    } catch (error) {
      lastError = error;
      intentos++;
      if (intentos < 3) await new Promise(r => setTimeout(r, 1000 * intentos));
    }
  }

  throw new Error(`No se pudo procesar el comprobante después de 3 intentos: ${lastError.message}`);
}

// Normaliza texto: mayúsculas, sin acentos, sin caracteres especiales
function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\s\-\.]/g, '')
    .trim()
    .substring(0, 40);
}

function redondear(n) {
  return Math.round((parseFloat(n) || 0) * 100) / 100;
}

module.exports = { extraerComprobante };
