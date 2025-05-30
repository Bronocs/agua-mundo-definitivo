// pages/api/guardar.js
import { google } from 'googleapis';

function generarNumeroOrden() {
  const ahora = new Date();
  const fechaStr = ahora
    .toISOString()
    .replace(/[-:T.Z]/g, '') // 20240528T181258.123Z → 20240528181258123
    .slice(0, 15); // YYYYMMDDHHMMSSmmm (hasta milisegundos)
  return `OP-${fechaStr}`;
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

    // El frontend debe enviar:
    // { nombreProyecto: "Nombre", productos: [ { nombre, unidad, cantidad, comentario } ] }
    const { nombreProyecto, productos } = req.body;
    if (!nombreProyecto || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const numeroOrden = generarNumeroOrden();
    const fechaActual = new Date().toLocaleDateString('es-PE');

    // Preparar las filas a agregar
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
      spreadsheetId: process.env.SHEET_PEDIDOS_ID,
      range: 'Pedidos_web!A2:G', // 7 columnas
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: valores }
    });

    res.status(200).json({ message: 'Pedido guardado correctamente', numeroOrden });
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    res.status(500).json({ error: 'Error al guardar en Sheets' });
  }
}
