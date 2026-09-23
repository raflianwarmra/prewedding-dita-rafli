(function () {
  "use strict";
  var root = document.documentElement;

  /* Light switch: toggles the gallery lights (theme) and remembers the choice. */
  var toggle = document.querySelector("[data-theme-toggle]");
  var toggleLabel = toggle.querySelector(".sr-only");
  function syncToggle() {
    var dark = root.dataset.theme === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggleLabel.textContent = window.I18N ? I18N.t(dark ? "theme.on" : "theme.off") : "";
    var meta = document.querySelectorAll('meta[name="theme-color"]');
    meta.forEach(function (m) { m.setAttribute("content", dark ? "#1c1012" : "#f6f0e6"); m.removeAttribute("media"); });
  }
  toggle.addEventListener("click", function () {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("dr-theme", root.dataset.theme); } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(8);
    syncToggle();
  });
  syncToggle();

  /* Follow the device setting until the visitor chooses. */
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    var saved = null;
    try { saved = localStorage.getItem("dr-theme"); } catch (err) {}
    if (!saved) { root.dataset.theme = e.matches ? "dark" : "light"; syncToggle(); }
  });

  /* Wayfinding label: shows the room currently crossing the upper third of the screen. */
  var label = document.querySelector("[data-where-label]");
  var places = document.querySelectorAll("[data-where]");
  var ROOM_META = {
    bugis: ["Adat", "01", "03", "Bugis-Makassar"], jawa: ["Adat", "02", "03", "Jawa"], palembang: ["Adat", "03", "03", "Palembang"],
    woven: ["Non-Adat", "04", "08", "Woven Together"], projection: ["Non-Adat", "05", "08", "Projection of Our Roots"],
    peranakan: ["Non-Adat", "06", "08", "Peranakan"], bappenas: ["Non-Adat", "07", "08", "Bappenas, Menteng"],
    "out-of-character": ["Non-Adat", "08", "08", "Out of Character"]
  };
  var whereNow = "foyer";
  function whereText(key) {
    var t = window.I18N ? I18N.t : function (k) { return k; };
    if (key.indexOf("room:") !== 0) return "<b>" + t("where." + key) + "</b>";
    var id = key.slice(5);
    if (id === "film") return t("where.epilogue") + " · <b>In Motion</b>";
    var m = ROOM_META[id];
    return m[0] + " · " + m[1] + " / " + m[2] + " · <b>" + m[3] + "</b>";
  }
  if (window.I18N) I18N.onChange(function () { label.innerHTML = whereText(whereNow); syncToggle(); });
  if ("IntersectionObserver" in window) {
    var whereObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        whereNow = entry.target.getAttribute("data-where");
        label.innerHTML = whereText(whereNow);
      });
    }, { rootMargin: "-30% 0px -69% 0px" });
    places.forEach(function (p) { whereObserver.observe(p); });

    /* Reveal photos and plaques as they arrive. */
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Palembang: switch between the colour and sepia prints.
     Delegated so copies of the room shown in the map's room page work too. */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-print]");
    if (!btn) return;
    var room = btn.closest(".room--palembang");
    var sepia = btn.dataset.print === "sepia";
    room.classList.toggle("is-sepia", sepia);
    room.querySelectorAll("[data-print]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === btn));
    });
    /* Sepia prints are lazy; make sure they load once asked for. */
    room.querySelectorAll(".print img + img").forEach(function (img) { img.loading = "eager"; });
  });
})();
