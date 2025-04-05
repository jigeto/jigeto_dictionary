
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [showTranslation, setShowTranslation] = useState(true);
  const [onlyUnlearned, setOnlyUnlearned] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const sheetId = '1OzrWFSttT9MznzIi3LdM6dadExN3ASTHSqoDg8e1-6M';
      const sheetName = 'Dictionary';
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
      const res = await fetch(url);
      const text = await res.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows.map(row => row.c.map(cell => cell ? cell.v : ''));
      const headers = json.table.cols.map(col => col.label);
      const result = rows.map(row => Object.fromEntries(row.map((val, i) => [headers[i], val])));
      setData(result);
    };
    fetchData();
  }, []);

  const filtered = data.filter(entry => {
    const matchesQuery = entry.Word?.toLowerCase().includes(query.toLowerCase()) || entry.Translation?.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All' || entry.Type === category;
    const matchesLearned = !onlyUnlearned || entry.Learned !== 'TRUE';
    return matchesQuery && matchesCategory && matchesLearned;
  });

  const categories = [...new Set(data.map(entry => entry.Type).filter(Boolean))];

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Jigeto Dictionary</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded flex-grow"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
          <option>All</option>
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>
        <button onClick={() => setShowTranslation(!showTranslation)} className="bg-black text-white px-4 py-2 rounded">
          {showTranslation ? 'Скрий превод' : 'Покажи превод'}
        </button>
      </div>
      <label className="mb-4 block">
        <input type="checkbox" checked={onlyUnlearned} onChange={() => setOnlyUnlearned(!onlyUnlearned)} className="mr-2" />
        Показвай само ненаучени
      </label>
      {filtered.map((entry, i) => (
        <div key={i} className="border rounded p-4 mb-4 shadow">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">{entry.Word}</h2>
            <span className="italic">{entry.Type}</span>
          </div>
          <div className="text-gray-600">{entry.Pronunciation}</div>
          {showTranslation && <div className="mt-2"><strong>Превод:</strong> {entry.Translation}</div>}
          {entry.Example && <div className="text-sm italic mt-1">{entry.Example}</div>}
          <label className="mt-2 block">
            <input type="checkbox" defaultChecked={entry.Learned === 'TRUE'} className="mr-2" />
            Научена дума
          </label>
        </div>
      ))}
    </main>
  );
}
