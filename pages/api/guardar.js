// pages/api/guardar.js
import { google } from 'googleapis';

async function generarNumeroOrden(sheets, spreadsheetId) {
  // 1. Leemos todos los códigos de orden en la columna A
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Pedidos_web!A2:A',
    majorDimension: 'COLUMNS',
  });
  const codigos = resp.data.values?.[0] || [];        // Array de strings ["2025-06-001", "2025-06-002", ...]

  // 2. Obtenemos el último código no vacío
  const ultimo = codigos.reverse().find(c => !!c) || ''; 
  const ahora = new Date();
  const year = ahora.getFullYear().toString();         // "2025"
  const month = String(ahora.getMonth() + 1).padStart(2, '0'); // "06"

  let secuencia = 1;
  if (ultimo) {
    // 3. Separamos año, mes y número de la última orden
    //    Suponemos formato "YYYY-MM-NNN"
    const [uYear, uMonth, uSeq] = ultimo.split('-');
    if (uYear === year && uMonth === month) {
      // Mismo mes: incrementar la secuencia
      secuencia = parseInt(uSeq, 10) + 1;
    }
    // Si no coincide año/mes, secuencia queda en 1
  }

  // 4. Formateamos con 3 dígitos
  const seqStr =  "DP" + String(secuencia).padStart(3, '0');
  return `${year}-${month}-${seqStr}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf8')
    );
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const { nombreProyecto, productos } = req.body;
    if (!nombreProyecto || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Generamos el nuevo número de orden según el mes
    const spreadsheetId = process.env.SHEET_PEDIDOS_ID;
    const numeroOrden = await generarNumeroOrden(sheets, spreadsheetId);

    // Fecha sólo para registrar, puede omitirse en el código
    const fechaActual = new Date().toLocaleDateString('es-PE');

    // Preparamos las filas a agregar
    const valores = productos.map(prod => [
      numeroOrden,
      nombreProyecto,
      fechaActual,
      prod.nombre || '',
      prod.unidad || '',
      prod.cantidad || '',
      prod.comentario || ''
    ]);

    // Insertamos las filas
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Pedidos_web!A2:G',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: valores },
    });

    res.status(200).json({ message: 'Pedido guardado', numeroOrden });
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    res.status(500).json({ error: 'Error al guardar en Sheets' });
  }
}
