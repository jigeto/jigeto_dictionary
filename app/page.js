"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showTranslation, setShowTranslation] = useState(true);
  const [showUnlearned, setShowUnlearned] = useState(false);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const filteredData = data.filter((entry) => {
    const matchesQuery =
      entry.word.toLowerCase().includes(query.toLowerCase()) ||
      entry.translation.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || entry.type === category;
    const matchesLearned = !showUnlearned || entry.learned !== "TRUE";
    return matchesQuery && matchesCategory && matchesLearned;
  });

  const categories = ["All", ...new Set(data.map((entry) => entry.type).filter(Boolean))];

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Jigeto Dictionary</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by word or translation..."
          className="border p-2 rounded w-full sm:w-1/2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {showTranslation ? "Скрий превод" : "Покажи превод"}
        </button>
      </div>
      <label className="mb-4 block">
        <input
          type="checkbox"
          checked={showUnlearned}
          onChange={() => setShowUnlearned(!showUnlearned)}
          className="mr-2"
        />
        Показвай само ненаучени
      </label>
      <div className="grid gap-4">
        {filteredData.map((entry, i) => (
          <div key={i} className="p-4 border rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{entry.word}</h2>
                <p className="text-gray-500 italic">{entry.pronunciation}</p>
              </div>
              <p className="italic text-gray-700">{entry.type}</p>
            </div>
            {showTranslation && (
              <p className="mt-2">
                <strong>Превод:</strong> {entry.translation}
              </p>
            )}
            <p className="mt-2">
              <strong>Пример:</strong> {entry.example}
            </p>
            <label className="block mt-2">
              <input
                type="checkbox"
                checked={entry.learned === "TRUE"}
                onChange={() => {}}
                disabled
                className="mr-2"
              />
              Научена дума
            </label>
          </div>
        ))}
      </div>
    </main>
  );
}
