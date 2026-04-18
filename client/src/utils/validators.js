export function validarCUIT(cuit) {
  const clean = (cuit || '').replace(/\D/g, '');
  if (clean.length !== 11) return false;

  const mult = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = mult.reduce((acc, m, i) => acc + parseInt(clean[i]) * m, 0);
  const resto = suma % 11;
  const dv = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

  return dv === parseInt(clean[10]);
}

export function validarFecha(fecha) {
  if (!fecha) return false;
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(fecha)) return false;
  const [dia, mes, año] = fecha.split('/').map(Number);
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (año < 2000 || año > 2099) return false;
  return true;
}

export function validarComprobante(datos) {
  const errores = [];

  if (!datos.tipo_comprobante) errores.push('Falta el tipo de comprobante');
  if (!validarFecha(datos.fecha)) errores.push('Fecha inválida (debe ser DD/MM/YYYY)');
  if (!datos.total || datos.total <= 0) errores.push('El total debe ser mayor a cero');
  if (datos.cuit_emisor && datos.cuit_emisor !== '00000000000') {
    if (!validarCUIT(datos.cuit_emisor)) errores.push('CUIT inválido (dígito verificador incorrecto)');
  }

  return errores;
}
