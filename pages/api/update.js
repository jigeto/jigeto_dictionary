
import { google } from "googleapis";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { rowIndex } = req.body;

  const keyFilePath = path.join(process.cwd(), "jigeto-dictionary-d0dab157dd20.json");
  const keyFile = await fs.readFile(keyFilePath, "utf8");
  const credentials = JSON.parse(keyFile);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = "1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M";
  const range = `Dictionary!J${rowIndex + 2}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [["TRUE"]] }
  });

  res.status(200).json({ success: true });
}
