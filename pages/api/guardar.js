// pages/api/guardar.js
import { google } from 'googleapis';

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
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const { productos } = req.body; // Array de productos con fecha, nombre, unidad, cantidad y comentario

    const valores = productos.map(p => [p.fecha, p.nombre, p.unidad, p.cantidad, p.comentario || '']);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_PEDIDOS_ID,
      range: 'Pedidos_web!A2:E',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: valores }
    });
    
    res.status(200).json({ message: 'Datos guardados correctamente' });
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    res.status(500).json({ error: 'Error al guardar en Sheets' });
  }
}

