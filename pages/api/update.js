// В pages/api/update.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Методът не е позволен" });
  }

  // Извличане на индекса на реда от тялото на заявката
  const { rowIndex } = req.body;
  
  if (rowIndex === undefined) {
    return res.status(400).json({ message: "Липсва rowIndex в заявката" });
  }

  try {
    // Интерпретиране на credentials
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    // Създаване на auth клиент
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    
    // Инициализиране на sheets API
    const sheets = google.sheets({ version: "v4", auth });
    
    // ID на таблицата
    const spreadsheetId = "1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M";
    
    // Коригирано: индексът на ред в Google Sheets започва от 1, добавяме 2 за да компенсираме заглавния ред
    // и да превърнем индекса в базиран на 0 към индекс в Google Sheets
    const actualRowIndex = parseInt(rowIndex) + 2; // +2 тъй като първият ред обикновено е заглавие
    
    // Колоната за Learned (предполагам това е колона E или колоната, в която се съхранява тази информация)
    // Можете да промените буквата на колоната, ако е различна във вашата таблица
    const range = `Dictionary!E${actualRowIndex}`;
    
    // Изпълняваме актуализацията с TRUE стойност
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["TRUE"]],
      },
    });
    
    return res.status(200).json({ message: "Успешно обновено" });
  } catch (error) {
    console.error("Грешка при запис:", error);
    
    // По-подробно докладване на грешки за по-лесно дебъгване
    return res.status(500).json({ 
      message: "Грешка при запис", 
      error: error.toString(),
      details: error.response?.data?.error || "Няма детайли"
    });
  }
}
