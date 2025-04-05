import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function Home() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hideTranslation, setHideTranslation] = useState(false);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const sheetId = "1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M";
      const sheetName = "Dictionary";
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
      const response = await fetch(url);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csv = decoder.decode(result.value);
      const parsed = Papa.parse(csv, { header: true });

      const cleanedData = parsed.data.map((row) => {
        const cleanedRow = {};
        for (let key in row) {
          const trimmedKey = key.trim();
          cleanedRow[trimmedKey] = row[key];
        }
        return cleanedRow;
      });
      setData(cleanedData);
    };

    fetchData();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(data.map((item) => item.Type?.trim()).filter(Boolean)))
  ];

  const filteredData = data.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      item.Word?.toLowerCase().includes(search) ||
      item.Translation?.toLowerCase().includes(search);
    const matchesCategory =
      selectedCategory === "All" || item.Type?.trim() === selectedCategory;
    const matchesLearned =
      !showOnlyUnlearned || item.Learned?.toLowerCase() !== "true";

    return matchesSearch && matchesCategory && matchesLearned;
  });

  const handleLearnedChange = async (filteredIndex) => {
    const word = filteredData[filteredIndex].Word;
    const realIndex = data.findIndex((item) => item.Word === word);

    if (realIndex === -1) return;

    const updated = [...data];
    updated[realIndex].Learned = "TRUE";
    setData(updated);

    try {
      const response = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex: realIndex }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Грешка при обновяване:", errorData);
      }
    } catch (error) {
      console.error("Грешка при заявката:", error);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      padding: "2.5rem 1rem"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "56rem",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h1 style={{
          fontSize: "1.875rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          textAlign: "center"
        }}>Jigeto Dictionary</h1>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <input
            type="text"
            placeholder="Търсене по дума или превод..."
            style={{
              border: "1px solid #d1d5db",
              padding: "0.5rem 0.75rem",
              flexGrow: 1,
              minWidth: "180px",
              borderRadius: "0.25rem"
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            style={{
              border: "1px solid #d1d5db",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.25rem"
            }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem"
            }}
            onClick={() => setHideTranslation(!hideTranslation)}
          >
            {hideTranslation ? "Покажи превод" : "Скрий превод"}
          </button>
        </div>

        <label style={{
          display: "block",
          marginBottom: "1.5rem",
          textAlign: "center"
        }}>
          <input
            type="checkbox"
            checked={showOnlyUnlearned}
            onChange={() => setShowOnlyUnlearned(!showOnlyUnlearned)}
            style={{ marginRight: "0.5rem" }}
          />
          Показвай само ненаучени думи
        </label>

        {filteredData.length === 0 ? (
          <p style={{ textAlign: "center" }}>Няма намерени думи.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {filteredData.map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #d1d5db",
                  padding: "1rem",
                  borderRadius: "0.25rem",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f9fafb"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.25rem"
                }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>{item.Word}</h2>
                  <span style={{ fontStyle: "italic", fontSize: "0.875rem", color: "#4b5563" }}>{item.Type}</span>
                </div>
                <p style={{ color: "#6b7280" }}>{item.Pronunciation}</p>
                {!hideTranslation && item.Translation && (
                  <p style={{ marginTop: "0.5rem" }}>
                    <strong>Превод:</strong> {item.Translation}
                  </p>
                )}
                {item.Example && (
                  <p style={{
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                    color: "#4b5563",
                    marginTop: "0.25rem"
                  }}>
                    {item.Example}
                  </p>
                )}
                <div style={{ marginTop: "0.5rem" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.Learned?.toLowerCase() === "true"}
                      onChange={() => handleLearnedChange(index)}
                      style={{ marginRight: "0.5rem" }}
                    />
                    Научена дума
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
