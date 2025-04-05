import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M";
    const range = "Dictionary!A2:J";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows.length) {
      return res.status(200).json({ data: [] });
    }

    const data = rows.map((row) => ({
      Word: row[0] || "",
      Type: row[1] || "",
      Pronunciation: row[2] || "",
      Translation: row[3] || "",
      Countability: row[4] || "",
      Plural: row[5] || "",
      Example: row[6] || "",
      Category: row[7] || "",
      Extra: row[8] || "",
      Learned: row[9] || "",
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error("❌ Грешка при четене:", error);
    res.status(500).json({ error: "Неуспешно четене от Sheets" });
  }
}
