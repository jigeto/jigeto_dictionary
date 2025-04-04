"use client";

import { useEffect, useState } from "react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAvcO0PgTEdfS8I4umGGpGZzPFl9BNED9MW7KDY_dTRGeTPdMIYEdZKT1u13GO0t0nOl3ykOtbXhJK/pub?output=csv";

export default function Home() {
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    fetch(SHEET_URL)
      .then((res) => res.text())
      .then((text) => {
        const rows = text.split("\n").map((row) => row.split(","));
        const headers = rows[0];
        const data = rows.slice(1).map((row) =>
          Object.fromEntries(row.map((cell, i) => [headers[i], cell]))
        );
        setWords(data);
      });
  }, []);

  const categories = ["All", ...new Set(words.map((w) => w.Type).filter(Boolean))];

  const filtered = words.filter((w) => {
    const matchesCategory = category === "All" || w.Type === category;
    const matchesSearch =
      w.Word.toLowerCase().includes(search.toLowerCase()) ||
      w.Translation.toLowerCase().includes(search.toLowerCase());
    const isUnlearned = showOnlyUnlearned ? w.Learned.trim() !== "TRUE" : true;
    return matchesCategory && matchesSearch && isUnlearned;
  });

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Jigeto Dictionary</h1>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by word or translation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => setShowTranslation((prev) => !prev)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {showTranslation ? "Скрий превод" : "Покажи превод"}
        </button>
      </div>
      <label className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={showOnlyUnlearned}
          onChange={(e) => setShowOnlyUnlearned(e.target.checked)}
        />
        Показвай само ненаучени
      </label>
      <div className="grid gap-4">
        {filtered.map((w, i) => (
          <div key={i} className="p-4 rounded-2xl shadow border">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">{w.Word}</h2>
              <span className="italic">{w.Type}</span>
            </div>
            <div className="text-gray-600">{w.Pronunciation}</div>
            {showTranslation && (
              <div className="mt-2">
                <strong>Превод:</strong> {w.Translation}
              </div>
            )}
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={w.Learned.trim() === "TRUE"} readOnly />
                Научена дума
              </label>
            </div>
            {w.Example && (
              <div className="text-sm text-gray-500 mt-1">{w.Example}</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}