// pages/api/update.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Методът не е позволен" });
  }

  const { rowIndex } = req.body;

  if (typeof rowIndex !== "number") {
    return res.status(400).json({ message: "Невалиден rowIndex" });
  }

  try {
    // Зареждане на credentials от ENV
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M";
    const sheetName = "Dictionary";
    const sheetColumn = "J"; // Learned column

    // Google Sheets започва редовете от 1, а първият ред е заглавие
    const targetRow = rowIndex + 2;
    const range = `${sheetName}!${sheetColumn}${targetRow}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["TRUE"]],
      },
    });

    res.status(200).json({ message: "Успешно записано" });
  } catch (error) {
    console.error("Грешка при запис в Sheets:", error);
    res.status(500).json({
      message: "Грешка при запис",
      error: error.message,
      details: error.response?.data || null,
    });
  }
}
