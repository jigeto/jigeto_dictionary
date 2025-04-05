import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST requests allowed');
  }

  const { rowIndex, column, value } = req.body;

  if (!rowIndex || !column || !value) {
    return res.status(400).send('Missing required data');
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M';
    const range = `Dictionary!${column}${rowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]],
      },
    });

    return res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return res.status(500).send('Internal Server Error');
  }
}
