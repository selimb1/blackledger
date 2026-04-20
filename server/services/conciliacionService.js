const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPT_EXTRACTO = `Sos un asistente contable argentino experto en extractos bancarios.
Analizá este extracto bancario y extraé TODAS las transacciones en orden cronológico.

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

Respondé ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown:
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

async function extraerTransacciones(pdfBase64, nombreArchivo) {
  const inicio = Date.now();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBase64,
      },
    },
    PROMPT_EXTRACTO,
  ]);

  const texto = result.response.text()
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let transacciones = JSON.parse(texto);

  transacciones = transacciones.map(t => ({
    ...t,
    importe: parseFloat(t.importe) || 0,
    saldo: t.saldo !== null ? parseFloat(t.saldo) : null,
    fuente: nombreArchivo,
  }));

  return {
    transacciones,
    procesado_en_ms: Date.now() - inicio,
    cantidad: transacciones.length,
  };
}

module.exports = { extraerTransacciones };
