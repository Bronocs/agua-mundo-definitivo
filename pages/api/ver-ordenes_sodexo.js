// pages/api/ver-ordenes.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_SODEXO_ID,
      range: 'Registro ventas 2.0!A2:AF',
    });

    const rows_sodexo = response.data.values || [];
    res.status(200).json(rows_sodexo);
  } catch (error) {
    console.error('Error al leer órdenes:', error);
    res.status(500).json({ error: 'Error al leer órdenes' });
  }
}
