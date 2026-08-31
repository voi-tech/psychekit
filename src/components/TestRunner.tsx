import { useEffect, useRef, useState } from "react";
import type { Gender, Instrument, OptionSet } from "@/domain/instrument";
import { resolveText } from "@/domain/instrument";
import { CURRENT_RESULT_KEY, type ResultSnapshot } from "@/domain/result";
import { scoreScale } from "@/engine/scoring";
import { deleteSession, loadSession, purgeExpiredSessions, saveResult, saveSession } from "@/infrastructure/db/database";
import { readGender, writeGender } from "@/infrastructure/preferences";
import { APP_VERSION } from "@/version";

type Stage = "forma" | "pytania" | "zapis";

const GENDER_LABELS: Record<Gender, string> = { m: "męska", f: "żeńska" };
/** Krótka pauza po wyborze, żeby zaznaczenie zdążyło się pokazać przed przejściem dalej. */
const PAUZA_PRZED_PRZEJSCIEM = 260;

export default function TestRunner({ instrument }: { instrument: Instrument }) {
  const sessionId = `aktywna:${instrument.id}`;
  const [stage, setStage] = useState<Stage>("forma");
  const [gender, setGender] = useState<Gender>("m");
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [snapshot, setSnapshot] = useState<ResultSnapshot | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const przejscie = useRef<number | null>(null);

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

  useEffect(() => () => { if (przejscie.current !== null) window.clearTimeout(przejscie.current); }, []);

  const anulujPrzejscie = () => {
    if (przejscie.current === null) return;
    window.clearTimeout(przejscie.current);
    przejscie.current = null;
  };

  if (!ready) {
    return (
      <section className="karta stos miara-szeroka" aria-live="polite">
        <div className="stos stos-zwarty">
          <h1>{instrument.name}</h1>
          <p className="kod">{instrument.code}</p>
        </div>
        <p className="meta">Wczytywanie kwestionariusza…</p>
      </section>
    );
  }

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

  if (stage === "zapis" && snapshot) return <SavePrompt snapshot={snapshot} />;

  const item = instrument.items[index];
  const optionSet = instrument.optionSets[item.optionSet];
  const total = instrument.items.length;
  const isLast = index === total - 1;

  const persistSession = (nextResponses: Record<string, string>, nextIndex: number) =>
    saveSession({ id: sessionId, instrumentId: instrument.id, gender, responses: nextResponses, currentIndex: nextIndex });

  const chooseOption = (optionId: string) => {
    const next = { ...responses, [item.id]: optionId };
    setResponses(next);
    setError("");
    void persistSession(next, index);
    anulujPrzejscie();
    // Ostatnie pytanie zostaje na ekranie: zakończenie kwestionariusza ma być świadome.
    if (isLast) return;
    przejscie.current = window.setTimeout(() => {
      przejscie.current = null;
      setIndex((current) => (current === index ? current + 1 : current));
      void persistSession(next, index + 1);
    }, PAUZA_PRZED_PRZEJSCIEM);
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
        name: instrument.name,
        code: instrument.code,
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

  const goNext = () => {
    anulujPrzejscie();
    if (!responses[item.id]) { setError("Wybierz jedną odpowiedź, aby przejść dalej."); return; }
    setError("");
    if (isLast) { void finish(); return; }
    setIndex(index + 1);
    void persistSession(responses, index + 1);
  };
  const goBack = () => { anulujPrzejscie(); setError(""); setIndex(Math.max(0, index - 1)); };

  return (
    <section className="karta stos stos-luzny miara-szeroka" aria-labelledby="tytul-kwestionariusza">
      <div className="stos">
        <div className="stos stos-zwarty">
          <p className="mikro">Pytanie {index + 1} z {total}</p>
          <h1 id="tytul-kwestionariusza" className="tytul-poboczny">{instrument.name}</h1>
        </div>
        <div
          className="podzialka"
          role="progressbar"
          aria-label="Postęp wypełniania"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
        >
          {instrument.items.map((candidate, position) => (
            <span
              key={candidate.id}
              aria-hidden="true"
              className={position === index ? "biezace" : responses[candidate.id] ? "odpowiedziane" : undefined}
            />
          ))}
        </div>
      </div>

      <div className="stos stos-luzny" role="radiogroup" aria-labelledby="tresc-pytania">
        <p id="tresc-pytania">
          {optionSet.prompt && <span className="pytanie-stem">{optionSet.prompt}</span>}
          <span className="pytanie-tresc">{resolveText(item.text, gender)}</span>
        </p>
        <Skala optionSet={optionSet} itemId={item.id} value={responses[item.id]} onChoose={chooseOption} />
      </div>

      {error && <p role="alert" className="notice danger">{error}</p>}

      <div className="akcje akcje-rozdzielone">
        <button className="btn btn-drugi" type="button" onClick={goBack} disabled={index === 0}>Wstecz</button>
        <button className="btn" type="button" onClick={goNext}>{isLast ? "Pokaż wynik" : "Dalej"}</button>
      </div>

      <div className="stopka stos stos-zwarty meta">
        <p>
          Forma {GENDER_LABELS[gender]}
          <button className="btn btn-tekst" type="button" onClick={() => { anulujPrzejscie(); setStage("forma"); }}>Zmień formę</button>
        </p>
        <p>{isLast ? "To ostatnie pytanie." : "Wybór odpowiedzi przenosi do następnego pytania."} Rozpoczęty kwestionariusz zapisuje się na tym urządzeniu i wygasa po siedmiu dniach.</p>
      </div>
    </section>
  );
}

/** Odpowiedzi tworzą uporządkowany ciąg, więc stoją jako punkty na jednej osi, a nie jako pola z tekstem. */
function Skala({ optionSet, itemId, value, onChoose }: {
  optionSet: OptionSet;
  itemId: string;
  value: string | undefined;
  onChoose: (optionId: string) => void;
}) {
  return (
    <div className="skala">
      {optionSet.options.map((option) => (
        <label className="stopien" key={option.id}>
          <input
            type="radio"
            name={itemId}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChoose(option.id)}
            aria-label={option.label}
          />
          <span className="stopien-punkt" aria-hidden="true" />
          <span className="stopien-etykieta" aria-hidden="true">{option.shortLabel ?? option.label}</span>
        </label>
      ))}
    </div>
  );
}

function GenderChoice({ instrument, gender, onGenderChange, onStart }: {
  instrument: Instrument;
  gender: Gender;
  onGenderChange: (value: Gender) => void;
  onStart: () => void;
}) {
  return (
    <section className="karta stos stos-luzny miara-szeroka" aria-labelledby="tytul-formy">
      <div className="stos stos-zwarty">
        <h1 id="tytul-formy">{instrument.name}</h1>
        <p className="kod">{instrument.code}</p>
        <p>{instrument.subtitle}</p>
        <p className="meta">{instrument.items.length} pytań · około {instrument.estimatedMinutes} minut</p>
      </div>

      <div className="stos" role="radiogroup" aria-labelledby="pytanie-o-forme">
        <p className="pytanie-tresc" id="pytanie-o-forme">W jakiej formie mają być zadawane pytania?</p>
        {(["m", "f"] as Gender[]).map((value) => (
          <label className="wybor" key={value}>
            <input type="radio" name="forma" value={value} checked={gender === value} onChange={() => onGenderChange(value)} />
            Forma {GENDER_LABELS[value]}
          </label>
        ))}
        <p className="meta">Wybór wpływa tylko na brzmienie pytań i zostaje zapamiętany na tym urządzeniu.</p>
      </div>

      <div className="notice stos stos-zwarty">
        <p>{instrument.disclaimer}</p>
        {instrument.adaptationNotice && <p className="meta">{instrument.adaptationNotice}</p>}
      </div>

      <div className="akcje akcje-rozdzielone">
        <a href="/">Wróć do listy</a>
        <button className="btn" type="button" onClick={onStart}>Rozpocznij</button>
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
    <section className="karta stos stos-luzny miara-szeroka" aria-live="polite">
      <div className="stos stos-zwarty">
        <h1>Wynik jest gotowy</h1>
        <p className="kod">{snapshot.name} · {snapshot.code}</p>
      </div>
      <div className="stos">
        <p>Czy zapisać ten wynik w historii na tym urządzeniu? Zapisany wynik zostaje tutaj, dopóki go nie usuniesz. Bez zapisu zobaczysz go tylko teraz.</p>
        <label className="wybor">
          <input type="checkbox" checked={saveChoice} onChange={(event) => setSaveChoice(event.target.checked)} />
          Zapisz wynik w historii
        </label>
      </div>
      <div className="akcje">
        <button className="btn" type="button" disabled={busy} onClick={() => void finishUp(saveChoice)}>Przejdź do wyniku</button>
        <button className="btn btn-drugi" type="button" disabled={busy} onClick={() => void finishUp(false)}>Pokaż bez zapisywania</button>
      </div>
    </section>
  );
}
