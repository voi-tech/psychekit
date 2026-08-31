import { Fragment, useEffect, useState } from "react";
import { buildMarkdownReport } from "@/domain/report/markdown";
import { CURRENT_RESULT_KEY, type ResultSnapshot } from "@/domain/result";

const HELPLINES = [
  { label: "Zagrożenie życia lub zdrowia", number: "112", href: "tel:112" },
  { label: "Kryzysowy telefon zaufania dla dorosłych", number: "116 123", href: "tel:116123" },
  { label: "Centrum wsparcia dla osób w kryzysie", number: "800 70 2222", href: "tel:800702222" },
  { label: "Telefon zaufania dla dzieci i młodzieży", number: "116 111", href: "tel:116111" },
];

export default function ResultView() {
  const [snapshot, setSnapshot] = useState<ResultSnapshot | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(CURRENT_RESULT_KEY);
    if (!raw) return;
    try { setSnapshot(JSON.parse(raw) as ResultSnapshot); } catch { sessionStorage.removeItem(CURRENT_RESULT_KEY); }
  }, []);

  if (!snapshot) {
    return (
      <div className="panel">
        <h1>Nie ma wyniku do pokazania</h1>
        <p>Wynik pojawi się tutaj po wypełnieniu kwestionariusza. Nie trafia do historii, dopóki tego nie wybierzesz.</p>
        <p><a href="/">Wybierz kwestionariusz</a></p>
      </div>
    );
  }

  const report = buildMarkdownReport(snapshot);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${snapshot.instrumentId}-wynik.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="hero">
      <h1>{snapshot.name}</h1>
      <p className="kod">{snapshot.code}</p>
      <p className="meta">Wypełniono {new Date(snapshot.completedAt).toLocaleString("pl-PL")}</p>

      <div className="result-grid">
        {snapshot.results.map((result) => (
          <article className="card" key={result.title}>
            <h2>{result.title}</h2>
            <p className="score">{result.score} <span className="meta">na {result.max}</span></p>
            {result.band
              ? <p>Przedział: {result.band}</p>
              : <p className="meta">Punktacja od {result.min} do {result.max}, bez podziału na przedziały.</p>}
          </article>
        ))}
      </div>

      {snapshot.safetyMessages.map((message) => (
        <div className="notice danger" key={message}>
          <p>{message}</p>
          <dl>
            {HELPLINES.map((line) => (
              <Fragment key={line.number}>
                <dt>{line.label}</dt>
                <dd><a href={line.href}>{line.number}</a></dd>
              </Fragment>
            ))}
          </dl>
        </div>
      ))}

      <p className="notice">{snapshot.disclaimer}</p>
      {snapshot.adaptationNotice && <p className="meta">{snapshot.adaptationNotice}</p>}

      <div className="question-actions">
        <button type="button" onClick={downloadReport}>Pobierz raport</button>
        <button className="secondary" type="button" onClick={() => void copyToClipboard()}>Skopiuj wynik do schowka</button>
      </div>
      {copied && <p role="status" className="meta">Wynik został skopiowany.</p>}
      <p className="meta">Jeśli wkleisz skopiowany tekst do zewnętrznej usługi, na przykład do asystenta opartego na sztucznej inteligencji, dane opuszczą PsycheKit i zaczną podlegać zasadom tej usługi.</p>

      <section className="panel">
        <h2>Źródła</h2>
        <ul>{snapshot.sources.map((source) => <li key={source}><a href={source}>{source}</a></li>)}</ul>
        {snapshot.attribution && <p className="meta">{snapshot.attribution}</p>}
      </section>
    </div>
  );
}
