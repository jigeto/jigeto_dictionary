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
      setData(parsed.data);
    };

    fetchData();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(data.map((item) => item.Type).filter(Boolean)))
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

  const handleLearnedChange = async (index) => {
    const updated = [...data];
    updated[index].Learned = "TRUE";
    setData(updated);

    await fetch("/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex: index }),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col items-center justify-center py-10 px-4">
      <main className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Jigeto Dictionary</h1>

        <div className="flex flex-wrap gap-2 mb-4 items-center justify-center">
          <input
            type="text"
            placeholder="Търсене по дума или превод..."
            className="border px-3 py-2 flex-grow min-w-[180px] rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded"
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
            className="bg-black text-white px-4 py-2 rounded"
            onClick={() => setHideTranslation(!hideTranslation)}
          >
            {hideTranslation ? "Покажи превод" : "Скрий превод"}
          </button>
        </div>

        <label className="block mb-6 text-center">
          <input
            type="checkbox"
            checked={showOnlyUnlearned}
            onChange={() => setShowOnlyUnlearned(!showOnlyUnlearned)}
            className="mr-2"
          />
          Показвай само ненаучени думи
        </label>

        {filteredData.length === 0 ? (
          <p className="text-center">Няма намерени думи.</p>
        ) : (
          <div className="space-y-6">
            {filteredData.map((item, index) => (
              <div
                key={index}
                className="border p-4 rounded shadow bg-gray-50"
              >
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-semibold">{item.Word}</h2>
                  <span className="italic text-sm text-gray-600">{item.Type}</span>
                </div>
                <p className="text-gray-500">{item.Pronunciation}</p>
                {!hideTranslation && item.Translation && (
                  <p className="mt-2">
                    <strong>Превод:</strong> {item.Translation}
                  </p>
                )}
                {item.Example && (
                  <p className="text-sm italic text-gray-700 mt-1">
                    {item.Example}
                  </p>
                )}
                <div className="mt-2">
                  <label>
                    <input
                      type="checkbox"
                      checked={item.Learned?.toLowerCase() === "true"}
                      onChange={() => handleLearnedChange(index)}
                      className="mr-2"
                    />
                    Научена дума
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
