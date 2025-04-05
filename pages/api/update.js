import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Методът не е позволен" });
  }

  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ message: "Липсва дума за обновяване" });
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M";

    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Dictionary!A2:A",
    });

    const rows = getRows.data.values;
    const rowIndex = rows.findIndex((row) => row[0] === word);

    if (rowIndex === -1) {
      return res.status(404).json({ message: "Думата не е намерена" });
    }

    const actualRow = rowIndex + 2;
    const range = `Dictionary!J${actualRow}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["TRUE"]] },
    });

    return res.status(200).json({ message: "Успешно обновено" });
  } catch (error) {
    console.error("Грешка при запис:", error);
    return res.status(500).json({ message: "Грешка при запис", error: error.toString() });
  }
}
