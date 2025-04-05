import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Методът не е позволен" });
  }

  const { rowIndex, column, value } = req.body;

  if (!rowIndex || !column || !value) {
    return res.status(400).json({ message: "Невалидни данни" });
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M";

    const range = `Dictionary!${column}${rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[value]],
      },
    });

    return res.status(200).json({ message: "Успешно обновено" });
  } catch (error) {
    console.error("Грешка при запис:", error);
    return res.status(500).json({ message: "Грешка при запис" });
  }
}
