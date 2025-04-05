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

  return (
    <main className="max-w-3xl mx-auto p-6 min-h-screen bg-white shadow-lg rounded-xl">

      <h1 className="text-3xl font-bold mb-4 text-center">Jigeto Dictionary</h1>

      <div className="flex flex-wrap gap-2 mb-4 items-center justify-center">
        <input
          type="text"
          placeholder="Търсене по дума или превод..."
          className="border px-2 py-1 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border px-2 py-1"
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
          className="bg-black text-white px-4 py-1 rounded"
          onClick={() => setHideTranslation(!hideTranslation)}
        >
          {hideTranslation ? "Покажи превод" : "Скрий превод"}
        </button>
      </div>

      <label className="block mb-4 text-center">
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
        <div className="space-y-4">
          {filteredData.map((item, index) => (
            <div
              key={index}
              className="border p-4 rounded shadow bg-white"
            >
              <div className="flex justify-between">
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
                    onChange={() => {}}
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
  );
}
