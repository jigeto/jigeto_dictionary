import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hideTranslation, setHideTranslation] = useState(false);
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/read");
        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error("❌ Грешка при зареждане:", error);
      }
    };

    fetchData();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(data.map((item) => item.Type).filter(Boolean))),
  ];

  const filteredData = data.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      item.Word?.toLowerCase().includes(search) ||
      item.Translation?.toLowerCase().includes(search);
    const matchesCategory =
      selectedCategory === "All" || item.Type === selectedCategory;
    const matchesLearned =
      !showOnlyUnlearned || item.Learned?.toLowerCase() !== "true";

    return matchesSearch && matchesCategory && matchesLearned;
  });

  const handleLearnedChange = async (word) => {
    const updated = data.map((item) =>
      item.Word === word ? { ...item, Learned: "TRUE" } : item
    );
    setData(updated);

    try {
      await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
    } catch (error) {
      console.error("❌ Грешка при запис в API:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Jigeto Dictionary</h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Търсене по дума или превод..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1, minWidth: "200px", padding: "0.5rem" }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button onClick={() => setHideTranslation(!hideTranslation)}>
          {hideTranslation ? "Покажи превод" : "Скрий превод"}
        </button>
      </div>

      <label>
        <input
          type="checkbox"
          checked={showOnlyUnlearned}
          onChange={() => setShowOnlyUnlearned(!showOnlyUnlearned)}
          style={{ marginRight: "0.5rem" }}
        />
        Показвай само ненаучени думи
      </label>

      <div style={{ marginTop: "1rem" }}>
        {filteredData.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{item.Word}</strong>
              <em>{item.Type}</em>
            </div>
            <div>{item.Pronunciation}</div>
            {!hideTranslation && <div><strong>Превод:</strong> {item.Translation}</div>}
            {item.Example && <div style={{ fontStyle: "italic", color: "#666" }}>{item.Example}</div>}
            <label>
              <input
                type="checkbox"
                checked={item.Learned?.toLowerCase() === "true"}
                onChange={() => handleLearnedChange(item.Word)}
                style={{ marginRight: "0.5rem" }}
              />
              Научена дума
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
