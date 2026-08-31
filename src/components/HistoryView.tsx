import { useEffect, useState, type CSSProperties } from "react";
import { deleteAllResults, deleteResult, listResults, type ResultRecord } from "@/infrastructure/db/database";

const RYTM_ZWARTY = { "--rytm": "var(--s2)" } as CSSProperties;
const RYTM_LUZNY = { "--rytm": "var(--s6)" } as CSSProperties;

export default function HistoryView() {
  const [results, setResults] = useState<ResultRecord[] | null>(null);

  const refresh = async () => setResults(await listResults());
  useEffect(() => { void refresh(); }, []);

  if (results === null) {
    return (
      <section className="panel rytm miara-formularz" aria-live="polite">
        <h1>Historia wyników</h1>
        <p className="meta">Wczytywanie zapisanych wyników…</p>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="panel rytm miara-formularz">
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
    <div className="rytm" style={RYTM_LUZNY}>
      <header className="rytm miara" style={RYTM_ZWARTY}>
        <p className="mikro">Zapisanych wyników: {results.length}</p>
        <h1>Historia wyników</h1>
        <p className="meta">Wszystkie są przechowywane wyłącznie na tym urządzeniu.</p>
      </header>

      <div className="siatka-kart">
        {results.map((record) => (
          <article className="karta rytm" key={record.id}>
            <div className="rytm" style={{ "--rytm": "var(--s1)" } as CSSProperties}>
              <h2 className="tytul-karty">{record.snapshot.name}</h2>
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
            <button className="btn btn-drugi" type="button" onClick={() => void removeOne(record.id)}>
              Usuń ten wynik<span className="sr-only"> — {record.snapshot.name}, {new Date(record.completedAt).toLocaleString("pl-PL")}</span>
            </button>
          </article>
        ))}
      </div>

      <div className="akcje">
        <button className="btn btn-drugi" type="button" onClick={() => void removeAll()}>Usuń wszystkie wyniki</button>
      </div>
    </div>
  );
}
