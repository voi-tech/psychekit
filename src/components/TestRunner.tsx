import { useEffect, useState } from "react";
import type { Gender, Instrument } from "@/domain/instrument";
import { resolveText } from "@/domain/instrument";
import { CURRENT_RESULT_KEY, type ResultSnapshot } from "@/domain/result";
import { scoreScale } from "@/engine/scoring";
import { deleteSession, loadSession, purgeExpiredSessions, saveResult, saveSession } from "@/infrastructure/db/database";
import { readGender, writeGender } from "@/infrastructure/preferences";
import { APP_VERSION } from "@/version";

type Stage = "forma" | "pytania" | "zapis";

const GENDER_LABELS: Record<Gender, string> = { m: "męska", f: "żeńska" };

export default function TestRunner({ instrument }: { instrument: Instrument }) {
  const sessionId = `aktywna:${instrument.id}`;
  const [stage, setStage] = useState<Stage>("forma");
  const [gender, setGender] = useState<Gender>("m");
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [snapshot, setSnapshot] = useState<ResultSnapshot | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      await purgeExpiredSessions();
      const session = await loadSession(sessionId);
      if (!active) return;
      const remembered = readGender();
      if (session) {
        setGender(session.gender);
        setResponses(session.responses);
        setIndex(Math.min(session.currentIndex, instrument.items.length - 1));
      } else if (remembered) {
        setGender(remembered);
      }
      setReady(true);
    })();
    return () => { active = false; };
  }, [instrument.items.length, sessionId]);

  if (!ready) return (
    <div className="panel" aria-live="polite">
      <h1>{instrument.title}</h1>
      <p>Wczytywanie kwestionariusza…</p>
    </div>
  );

  if (stage === "forma") {
    return (
      <GenderChoice
        instrument={instrument}
        gender={gender}
        onGenderChange={setGender}
        onStart={() => { writeGender(gender); setStage("pytania"); }}
      />
    );
  }

  if (stage === "zapis" && snapshot) {
    return <SavePrompt snapshot={snapshot} />;
  }

  const item = instrument.items[index];
  const optionSet = instrument.optionSets[item.optionSet];
  const percent = ((index + 1) / instrument.items.length) * 100;

  const persistSession = (nextResponses: Record<string, string>, nextIndex: number) =>
    saveSession({ id: sessionId, instrumentId: instrument.id, gender, responses: nextResponses, currentIndex: nextIndex });

  const chooseOption = (optionId: string) => {
    const next = { ...responses, [item.id]: optionId };
    setResponses(next);
    setError("");
    void persistSession(next, index);
  };

  const finish = async () => {
    try {
      const results = instrument.scales.map((scale) => scoreScale(scale, instrument.items, instrument.optionSets, responses));
      const safetyMessages = instrument.safetySignals
        .filter((signal) => {
          const signalItem = instrument.items.find((candidate) => candidate.id === signal.item);
          if (!signalItem) return false;
          const selected = instrument.optionSets[signalItem.optionSet].options.find((option) => option.id === responses[signal.item]);
          return selected !== undefined && selected.score >= signal.when.scoreGte;
        })
        .map((signal) => signal.message ?? "Ta odpowiedź wymaga szczególnej uwagi.");
      const next: ResultSnapshot = {
        instrumentId: instrument.id,
        title: instrument.title,
        definitionVersion: instrument.definitionVersion,
        appVersion: APP_VERSION,
        completedAt: Date.now(),
        results: results.map((result) => ({ title: result.title, score: result.score, min: result.min, max: result.max, band: result.band?.label ?? null })),
        disclaimer: instrument.disclaimer,
        attribution: instrument.attribution,
        adaptationNotice: instrument.adaptationNotice,
        sources: instrument.sources,
        safetyMessages,
      };
      sessionStorage.setItem(CURRENT_RESULT_KEY, JSON.stringify(next));
      await deleteSession(sessionId);
      setSnapshot(next);
      setStage("zapis");
    } catch {
      setError("Nie udało się obliczyć wyniku. Odpowiedzi pozostały zapisane na tym urządzeniu.");
    }
  };

  const isLast = index === instrument.items.length - 1;
  const goNext = () => {
    if (!responses[item.id]) { setError("Wybierz jedną odpowiedź, aby przejść dalej."); return; }
    setError("");
    if (isLast) { void finish(); return; }
    setIndex(index + 1);
    void persistSession(responses, index + 1);
  };
  const goBack = () => { setError(""); setIndex(Math.max(0, index - 1)); };

  return (
    <section aria-labelledby="tytul-kwestionariusza" className="panel">
      <h1 id="tytul-kwestionariusza">{instrument.title}</h1>
      <p className="meta">Pytanie {index + 1} z {instrument.items.length} · forma {GENDER_LABELS[gender]}{" "}
        <button className="secondary" type="button" onClick={() => setStage("forma")}>Zmień formę</button>
      </p>
      <div
        className="progress"
        role="progressbar"
        aria-label="Postęp wypełniania"
        aria-valuemin={1}
        aria-valuemax={instrument.items.length}
        aria-valuenow={index + 1}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <fieldset className="options">
        <legend><strong>{resolveText(item.text, gender)}</strong></legend>
        {optionSet.options.map((option) => (
          <label className="option" key={option.id}>
            <input
              type="radio"
              name={item.id}
              value={option.id}
              checked={responses[item.id] === option.id}
              onChange={() => chooseOption(option.id)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      {error && <p role="alert" className="notice">{error}</p>}
      <div className="question-actions">
        <button className="secondary" type="button" onClick={goBack} disabled={index === 0}>Wstecz</button>
        <button type="button" onClick={goNext}>{isLast ? "Pokaż wynik" : "Dalej"}</button>
      </div>
      <p className="meta">Rozpoczęty kwestionariusz zapisuje się na tym urządzeniu i wygasa po siedmiu dniach.</p>
    </section>
  );
}

function GenderChoice({ instrument, gender, onGenderChange, onStart }: {
  instrument: Instrument;
  gender: Gender;
  onGenderChange: (value: Gender) => void;
  onStart: () => void;
}) {
  return (
    <section className="panel" aria-labelledby="tytul-formy">
      <h1 id="tytul-formy">{instrument.title}</h1>
      <p>{instrument.subtitle}</p>
      <p className="meta">{instrument.items.length} pytań · około {instrument.estimatedMinutes} minut</p>
      <fieldset className="options">
        <legend><strong>W jakiej formie mają być zadawane pytania?</strong></legend>
        {(["m", "f"] as Gender[]).map((value) => (
          <label className="option" key={value}>
            <input type="radio" name="forma" value={value} checked={gender === value} onChange={() => onGenderChange(value)} />
            Forma {GENDER_LABELS[value]}
          </label>
        ))}
      </fieldset>
      <p className="meta">Wybór wpływa tylko na brzmienie pytań i zostaje zapamiętany na tym urządzeniu.</p>
      {instrument.adaptationNotice && <p className="meta">{instrument.adaptationNotice}</p>}
      <p className="notice">{instrument.disclaimer}</p>
      <div className="question-actions">
        <a href="/">Wróć do listy</a>
        <button type="button" onClick={onStart}>Rozpocznij</button>
      </div>
    </section>
  );
}

function SavePrompt({ snapshot }: { snapshot: ResultSnapshot }) {
  const [saveChoice, setSaveChoice] = useState(false);
  const [busy, setBusy] = useState(false);

  const finishUp = async (shouldSave: boolean) => {
    setBusy(true);
    if (shouldSave) {
      await saveResult({ id: crypto.randomUUID(), instrumentId: snapshot.instrumentId, completedAt: snapshot.completedAt, snapshot });
    }
    window.location.assign("/wynik/");
  };

  return (
    <div className="panel" aria-live="polite">
      <h1>Wynik jest gotowy</h1>
      <p>Czy zapisać ten wynik w historii na tym urządzeniu?</p>
      <p className="meta">Zapisany wynik pozostaje na tym urządzeniu do czasu, aż go usuniesz. Bez zapisu zobaczysz go tylko teraz.</p>
      <label className="option">
        <input type="checkbox" checked={saveChoice} onChange={(event) => setSaveChoice(event.target.checked)} />
        Zapisz wynik w historii
      </label>
      <div className="question-actions">
        <button className="secondary" type="button" disabled={busy} onClick={() => void finishUp(false)}>Pokaż bez zapisywania</button>
        <button type="button" disabled={busy} onClick={() => void finishUp(saveChoice)}>Przejdź do wyniku</button>
      </div>
    </div>
  );
}
