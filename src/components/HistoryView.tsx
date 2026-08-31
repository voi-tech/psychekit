import { useEffect, useState } from "react";
import { deleteAllResults, deleteResult, listResults, type ResultRecord } from "@/infrastructure/db/database";

export default function HistoryView() {
  const [results, setResults] = useState<ResultRecord[] | null>(null);

  const refresh = async () => setResults(await listResults());
  useEffect(() => { void refresh(); }, []);

  if (results === null) {
    return (
      <section className="karta stos miara-szeroka" aria-live="polite">
        <h1>Historia wyników</h1>
        <p className="meta">Wczytywanie zapisanych wyników…</p>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="karta stos miara-szeroka">
        <h1>Historia wyników</h1>
        <p>Nie ma tu jeszcze żadnego wyniku. PsycheKit zapisuje wynik dopiero wtedy, gdy wybierzesz to po wypełnieniu kwestionariusza.</p>
        <p><a className="btn" href="/">Wybierz kwestionariusz</a></p>
      </section>
    );
  }

  const removeOne = async (id: string) => { await deleteResult(id); await refresh(); };
  const removeAll = async () => {
    if (!window.confirm("Usunąć wszystkie zapisane wyniki? Tej operacji nie można cofnąć.")) return;
    await deleteAllResults();
    await refresh();
  };

  return (
    <div className="stos stos-sekcje">
      <header className="stos stos-zwarty miara">
        <h1>Historia wyników</h1>
        <p className="meta">Zapisanych wyników: {results.length}. Wszystkie są przechowywane wyłącznie na tym urządzeniu.</p>
      </header>

      <div className="siatka siatka-szeroka">
        {results.map((record) => (
          <article className="karta stos stos-luzny" key={record.id}>
            <div className="stos stos-zwarty">
              <h2 className="tytul-poboczny">{record.snapshot.name}</h2>
              <p className="kod">{record.snapshot.code}</p>
              <p className="meta">{new Date(record.completedAt).toLocaleString("pl-PL")}</p>
            </div>
            <dl className="dane">
              {record.snapshot.results.map((result) => (
                <div key={result.title}>
                  <dt>{result.title}</dt>
                  <dd>{result.score} na {result.max}{result.band ? ` — ${result.band}` : ""}</dd>
                </div>
              ))}
            </dl>
            <p>
              <button className="btn btn-drugi" type="button" onClick={() => void removeOne(record.id)}>
                Usuń ten wynik<span className="sr-only"> — {record.snapshot.name}, {new Date(record.completedAt).toLocaleString("pl-PL")}</span>
              </button>
            </p>
          </article>
        ))}
      </div>

      <div className="akcje">
        <button className="btn btn-drugi" type="button" onClick={() => void removeAll()}>Usuń wszystkie wyniki</button>
      </div>
    </div>
  );
}
