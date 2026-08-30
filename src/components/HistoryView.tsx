import { useEffect, useState } from "react";
import { deleteAllResults, deleteResult, listResults, type ResultRecord } from "@/infrastructure/db/database";

export default function HistoryView() {
  const [results, setResults] = useState<ResultRecord[] | null>(null);

  const refresh = async () => setResults(await listResults());
  useEffect(() => { void refresh(); }, []);

  if (results === null) return (
    <div className="panel" aria-live="polite">
      <h1>Historia wyników</h1>
      <p>Wczytywanie zapisanych wyników…</p>
    </div>
  );

  if (results.length === 0) {
    return (
      <div className="panel">
        <h1>Historia wyników</h1>
        <p>Nie ma tu jeszcze żadnego wyniku. PsycheKit zapisuje wynik dopiero wtedy, gdy wybierzesz to po wypełnieniu kwestionariusza.</p>
        <p><a href="/">Wybierz kwestionariusz</a></p>
      </div>
    );
  }

  const removeOne = async (id: string) => { await deleteResult(id); await refresh(); };
  const removeAll = async () => {
    if (!window.confirm("Usunąć wszystkie zapisane wyniki? Tej operacji nie można cofnąć.")) return;
    await deleteAllResults();
    await refresh();
  };

  return (
    <div className="hero">
      <h1>Historia wyników</h1>
      <p className="meta">Zapisane wyniki: {results.length}. Wszystkie są przechowywane wyłącznie na tym urządzeniu.</p>
      {results.map((record) => (
        <article className="card" key={record.id}>
          <h2>{record.snapshot.title}</h2>
          <p className="meta">Wypełniono {new Date(record.completedAt).toLocaleString("pl-PL")}</p>
          <ul>
            {record.snapshot.results.map((result) => (
              <li key={result.title}>
                {result.title}: {result.score} na {result.max}{result.band ? ` — ${result.band}` : ""}
              </li>
            ))}
          </ul>
          <button className="secondary" type="button" onClick={() => void removeOne(record.id)}>
            Usuń ten wynik<span className="sr-only"> — {record.snapshot.title}, {new Date(record.completedAt).toLocaleString("pl-PL")}</span>
          </button>
        </article>
      ))}
      <div className="question-actions">
        <button className="secondary" type="button" onClick={() => void removeAll()}>Usuń wszystkie wyniki</button>
      </div>
    </div>
  );
}
