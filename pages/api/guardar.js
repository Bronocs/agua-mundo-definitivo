// pages/api/guardar.js
import { google } from 'googleapis';

async function generarNumeroOrden(sheets, spreadsheetId) {
  // 1. Leemos todos los códigos de orden en la columna A
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Pedidos_web!A2:A',
    majorDimension: 'COLUMNS',
  });
  const codigos = resp.data.values?.[0] || [];

  // 2. Obtenemos el último código que tenga prefijo DP-
  const ultimo = codigos
    .reverse()
    .find(c => typeof c === 'string' && c.startsWith('DP-')) || '';

  const ahora = new Date();
  const year = ahora.getFullYear().toString();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');

  let secuencia = 1;
  if (ultimo) {
    // Formato "DP-YYYY-MM-NNN"
    const partes = ultimo.split('-');
    const [prefix, uYear, uMonth, uSeq] = partes;
    if (uYear === year && uMonth === month) {
      secuencia = parseInt(uSeq, 10) + 1;
    }
  }

  const seqStr = String(secuencia).padStart(3, '0');
  return `DP-${year}-${month}-${seqStr}`;
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

    const spreadsheetId = process.env.SHEET_PEDIDOS_ID;
    const numeroOrden = await generarNumeroOrden(sheets, spreadsheetId);
    const fechaActual = new Date().toLocaleDateString('es-PE');

    const valores = productos.map(prod => [
      numeroOrden,
      nombreProyecto,
      fechaActual,
      prod.nombre || '',
      prod.unidad || '',
      prod.cantidad || '',
      prod.comentario || ''
    ]);

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
