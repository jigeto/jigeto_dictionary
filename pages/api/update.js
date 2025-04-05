import { google } from "googleapis";
import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Методът не е позволен");
  }

  try {
    const { rowIndex } = req.body;

    // Зареждане на service account ключовете
    const keyPath = path.join(process.cwd(), "jigeto-dictionary-d0dab157dd20.json");
    const keyFile = await fs.readFile(keyPath, "utf-8");
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M";
    const range = `Dictionary!F${rowIndex + 2}`; // Колона "Learned", започвайки от ред 2

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [["TRUE"]],
      },
    });

    res.status(200).json({ message: "Успешно записано!" });
  } catch (error) {
    console.error("Грешка при запис в Google Sheets:", error);
    res.status(500).json({ error: "Грешка при запис в Google Sheets" });
  }
}
