import tabletop from "tabletop";

export async function GET() {
  try {
    const sheetURL = "https://docs.google.com/spreadsheets/d/1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M/edit?usp=sharing";
    const data = await tabletop.init({ key: sheetURL, simpleSheet: true });
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
