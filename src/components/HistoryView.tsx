import { useEffect, useState } from "react";
import { deleteResult, listResults } from "@/infrastructure/db/database";

export default function HistoryView() {
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => { void listResults().then(setResults); }, []);
  const remove = async (id: string) => { await deleteResult(id); setResults(await listResults()); };
  if (!results.length) return <div className="panel"><h1>Historia wyników</h1><p>PsycheKit nie zapisuje ukończonych wyników bez Twojej zgody. Po zapisaniu wyników znajdziesz je tutaj.</p></div>;
  return <div className="hero"><h1>Historia wyników</h1>{results.map((record) => <article className="card" key={record.id}><h2>{record.snapshot.title}</h2><p>{new Date(record.completedAt).toLocaleString("pl-PL")}</p><ul>{record.snapshot.results.map((result: any) => <li key={result.title}>{result.title}: {result.score} / {result.max} — {result.band}</li>)}</ul><button className="secondary" type="button" onClick={() => void remove(record.id)}>Usuń wynik</button></article>)}</div>;
}
