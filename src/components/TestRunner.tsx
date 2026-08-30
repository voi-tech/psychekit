import { useEffect, useState } from "react";
import { scoreScale } from "@/engine/scoring";
import { db, loadSession, purgeExpiredSessions, saveResult, saveSession } from "@/infrastructure/db/database";

const APP_VERSION = "26.8.0";
type Instrument = { id: string; title: string; subtitle: string; definitionVersion: string; disclaimer: string; sources: string[]; items: any[]; optionSets: Record<string, any>; scales: any[]; safetySignals: any[] };
type Snapshot = { instrumentId: string; title: string; definitionVersion: string; appVersion: string; completedAt: number; results: Array<{ title: string; score: number; max: number; band: string }>; disclaimer: string; sources: string[]; safetyMessages: string[] };

export default function TestRunner({ instrument }: { instrument: Instrument }) {
  const sessionId = `active:${instrument.id}`;
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [saveChoice, setSaveChoice] = useState(false);
  const [error, setError] = useState("");
  const item = instrument.items[index];
  const optionSet = instrument.optionSets[item.optionSet];
  const percent = ((index + 1) / instrument.items.length) * 100;

  useEffect(() => {
    void purgeExpiredSessions().then(() => loadSession(sessionId)).then((session) => {
      if (session) { setResponses(session.responses); setIndex(Math.min(session.currentIndex, instrument.items.length - 1)); }
    });
  }, [instrument.items.length, sessionId]);

  const updateResponse = (value: string) => {
    const next = { ...responses, [item.id]: value };
    setResponses(next);
    void saveSession({ id: sessionId, instrumentId: instrument.id, responses: next, currentIndex: index, createdAt: Date.now(), updatedAt: Date.now() });
  };
  const finish = async () => {
    try {
      const results = instrument.scales.map((scale) => scoreScale(scale, instrument.items, instrument.optionSets, responses));
      const safetyMessages = instrument.safetySignals.filter((signal) => {
        const answer = instrument.items.find((candidate) => candidate.id === signal.item);
        const selected = instrument.optionSets[answer.optionSet].options.find((option: any) => option.id === responses[signal.item]);
        return selected && selected.score >= signal.when.scoreGte;
      }).map((signal) => signal.message ?? "Ta odpowiedź zasługuje na dodatkową uwagę.");
      const next: Snapshot = { instrumentId: instrument.id, title: instrument.title, definitionVersion: instrument.definitionVersion, appVersion: APP_VERSION, completedAt: Date.now(), results: results.map((result) => ({ title: result.title, score: result.score, max: result.max, band: result.band.label })), disclaimer: instrument.disclaimer, sources: instrument.sources, safetyMessages };
      sessionStorage.setItem("psychekit:last-result", JSON.stringify(next));
      await db.sessions.delete(sessionId);
      setSnapshot(next);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Nie udało się obliczyć wyniku."); }
  };
  const goNext = () => { if (!responses[item.id]) { setError("Wybierz jedną odpowiedź, aby przejść dalej."); return; } setError(""); if (index === instrument.items.length - 1) void finish(); else { setIndex(index + 1); void saveSession({ id: sessionId, instrumentId: instrument.id, responses, currentIndex: index + 1, createdAt: Date.now(), updatedAt: Date.now() }); } };
  const goBack = () => { setError(""); setIndex(Math.max(0, index - 1)); };

  if (snapshot) return <SavePrompt snapshot={snapshot} saveChoice={saveChoice} setSaveChoice={setSaveChoice} />;
  return <section aria-labelledby="test-title" className="panel">
    <p className="eyebrow">Pytanie {index + 1} z {instrument.items.length}</p>
    <h1 id="test-title">{instrument.title}</h1>
    <div className="progress" role="progressbar" aria-label="Postęp kwestionariusza" aria-valuemin={1} aria-valuemax={instrument.items.length} aria-valuenow={index + 1}><span style={{ width: `${percent}%` }} /></div>
    <fieldset className="options"><legend><strong>{item.text}</strong></legend>
      {optionSet.options.map((option: any) => <label className="option" key={option.id}><input type="radio" name={item.id} value={option.id} checked={responses[item.id] === option.id} onChange={() => updateResponse(option.id)} />{option.label}</label>)}
    </fieldset>
    {error && <p role="alert" className="notice">{error}</p>}
    <div className="question-actions"><button className="secondary" type="button" onClick={goBack} disabled={index === 0}>Wstecz</button><button type="button" onClick={goNext}>{index === instrument.items.length - 1 ? "Pokaż wynik" : "Dalej"}</button></div>
    <p className="meta">Odpowiedzi są zapisywane lokalnie jako sesja robocza i wygasają po 7 dniach.</p>
  </section>;
}

function SavePrompt({ snapshot, saveChoice, setSaveChoice }: { snapshot: Snapshot; saveChoice: boolean; setSaveChoice: (value: boolean) => void }) {
  const [saved, setSaved] = useState(false);
  const persist = async (shouldSave: boolean) => {
    if (shouldSave) { await saveResult({ id: crypto.randomUUID(), instrumentId: snapshot.instrumentId, completedAt: snapshot.completedAt, snapshot }); setSaved(true); }
    window.location.assign("/wynik/");
  };
  return <div className="panel" aria-live="polite"><h1>Wynik jest gotowy</h1><p>Zapisać wynik na tym urządzeniu?</p><p className="meta">Wynik będzie przechowywany na tym urządzeniu, dopóki go nie usuniesz.</p><label className="option"><input type="checkbox" checked={saveChoice} onChange={(event) => setSaveChoice(event.target.checked)} />Tak, zapisz wynik w historii</label><div className="question-actions"><button className="secondary" type="button" onClick={() => void persist(false)}>Nie, pokaż wynik</button><button type="button" onClick={() => void persist(saveChoice)}>Zapisz i pokaż wynik</button></div>{saved && <p>Wynik zapisany.</p>}</div>;
}
