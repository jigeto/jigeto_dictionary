'use client';

import { useEffect, useState } from 'react';
import Tabletop from 'tabletop';

export default function Home() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showTranslation, setShowTranslation] = useState(true);
  const [showUnlearnedOnly, setShowUnlearnedOnly] = useState(false);

  useEffect(() => {
    Tabletop.init({
      key: '1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M',
      simpleSheet: true,
      wanted: ['Dictionary'],
      callback: (data) => setData(data),
    });
  }, []);

  const filtered = data.filter((item) => {
    const matchSearch =
      item.Word?.toLowerCase().includes(search.toLowerCase()) ||
      item.Translation?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || item.Type === typeFilter;
    const matchLearned = !showUnlearnedOnly || item.Learned !== 'TRUE';
    return matchSearch && matchType && matchLearned;
  });

  const uniqueTypes = ['All', ...new Set(data.map((item) => item.Type).filter(Boolean))];

  return (
    <main className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Jigeto Dictionary</h1>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Търси дума или превод..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {uniqueTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={showUnlearnedOnly}
            onChange={() => setShowUnlearnedOnly(!showUnlearnedOnly)}
          />
          Само ненаучени
        </label>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-sm underline"
        >
          {showTranslation ? 'Скрий превод' : 'Покажи превод'}
        </button>
      </div>

      {filtered.map((item, idx) => (
        <div key={idx} className="border rounded p-4 space-y-1">
          <div className="flex justify-between">
            <strong>{item.Word}</strong>
            <span className="text-sm italic text-gray-500">{item.Type}</span>
          </div>
          <div className="text-gray-600 text-sm italic">{item.Pronunciation}</div>
          {item.Example && <div className="text-sm italic">„{item.Example}“</div>}
          {showTranslation && (
            <div className="text-sm mt-1">
              <strong>Превод:</strong> {item.Translation}
            </div>
          )}
          <div className="text-sm">
            <label className="flex gap-2 items-center">
              <input type="checkbox" checked={item.Learned === 'TRUE'} readOnly />
              Научена дума
            </label>
          </div>
        </div>
      ))}
    </main>
  );
}