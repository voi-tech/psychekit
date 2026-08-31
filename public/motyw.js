(function () {
  const KEY = "psychekit:theme";
  const KOLEJNOSC = ["auto", "light", "dark"];
  /** @type {Record<string, string>} */
  const OPIS = { auto: "jak w systemie", light: "jasny", dark: "ciemny" };

  /** @returns {"auto" | "light" | "dark"} */
  function odczytaj() {
    try {
      const zapisany = localStorage.getItem(KEY);
      return zapisany === "light" || zapisany === "dark" ? zapisany : "auto";
    } catch (blad) {
      return "auto";
    }
  }

  /** @param {string} wybor */
  function zastosuj(wybor) {
    if (wybor === "light") document.documentElement.setAttribute("data-motyw", "jasny");
    else if (wybor === "dark") document.documentElement.setAttribute("data-motyw", "ciemny");
    else document.documentElement.removeAttribute("data-motyw");
  }

  /** @param {string} wybor @returns {string} */
  function nastepny(wybor) {
    return KOLEJNOSC[(KOLEJNOSC.indexOf(wybor) + 1) % KOLEJNOSC.length];
  }

  zastosuj(odczytaj());

  document.addEventListener("DOMContentLoaded", function () {
    const znaleziony = document.getElementById("przelacznik-motywu");
    if (!(znaleziony instanceof HTMLButtonElement)) return;
    const przycisk = znaleziony;

    /** @param {string} wybor */
    function opisz(wybor) {
      przycisk.setAttribute("aria-label", `Wygląd: ${OPIS[wybor]}. Przełącz na ${OPIS[nastepny(wybor)]}`);
      przycisk.title = `Wygląd: ${OPIS[wybor]}`;
    }

    opisz(odczytaj());
    przycisk.addEventListener("click", function () {
      const wybor = nastepny(odczytaj());
      zastosuj(wybor);
      opisz(wybor);
      try { localStorage.setItem(KEY, wybor); } catch (blad) { /* zapis niedostępny, wybór działa do końca sesji */ }
    });
  });
})();
