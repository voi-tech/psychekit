(function () {
  const KEY = "psychekit:theme";

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

  zastosuj(odczytaj());

  document.addEventListener("DOMContentLoaded", function () {
    const znaleziony = document.getElementById("wybor-motywu");
    if (!(znaleziony instanceof HTMLSelectElement)) return;
    const pole = znaleziony;
    pole.value = odczytaj();
    pole.addEventListener("change", function () {
      zastosuj(pole.value);
      try { localStorage.setItem(KEY, pole.value); } catch (blad) { /* zapis niedostępny, wybór działa do końca sesji */ }
    });
  });
})();
