/* Landing: four short scenes that introduce the exhibition and how to walk through it.
   Shown on the first visit to the map (not for deep links), and again from "How to visit". */
(function () {
  "use strict";
  var root = document.documentElement;
  var intro = document.querySelector("[data-intro]");
  if (!intro || !window.DRMap) return;

  var visual = intro.querySelector("[data-intro-visual]");
  var modelBox = intro.querySelector("[data-intro-model]");
  var finger = intro.querySelector("[data-intro-finger]");
  var bubble = intro.querySelector("[data-intro-bubble]");
  var next = intro.querySelector("[data-intro-next]");
  var steps = intro.querySelectorAll("[data-intro-step]");
  var dots = intro.querySelectorAll(".intro__dots i");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var touch = window.matchMedia("(hover: none)").matches;
  var LAST = 3, scene = 0, timers = [], mini = null, lastFocus = null;
  var outside = [document.querySelector(".bar"), document.querySelector(".mapview"), document.querySelector(".scrollview"), document.querySelector(".footer")];

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function seen(v) { try { if (v) localStorage.setItem("dr-intro-seen", "1"); return localStorage.getItem("dr-intro-seen") === "1"; } catch (e) { return false; } }

  /* ---------- A mini copy of the real maquette ---------- */
  function buildMini() {
    if (mini) return;
    mini = document.createElement("div");
    mini.className = "maq";
    mini.innerHTML = '<div class="maq__camera"></div>';
    var sc = window.DRMap.scene.cloneNode(true);
    sc.removeAttribute("data-scene");
    sc.querySelectorAll("button").forEach(function (b) { b.tabIndex = -1; });
    sc.querySelectorAll(".is-selected, .is-visited, .is-hot").forEach(function (n) { n.classList.remove("is-selected", "is-visited", "is-hot"); });
    mini.firstChild.appendChild(sc);
    modelBox.appendChild(mini);
  }
  function fitMini() {
    var W = 8.8, D = 17.6, s = 20 * Math.PI / 180, t = 48 * Math.PI / 180;
    var u = Math.max(12, (modelBox.clientWidth || 300) / (W * Math.cos(s) + D * Math.sin(s) + 1.8));
    var avail = visual.clientHeight - 10;
    for (var pass = 0; pass < 3; pass++) {
      mini.style.setProperty("--u", u + "px");
      mini.style.setProperty("--nudge", "0px");
      mini.style.setProperty("--maq-h", "900px");
      var g = mini.querySelector(".m-ground").getBoundingClientRect(), mb = mini.getBoundingClientRect();
      var top = g.top - mb.top - 1.3 * u * Math.sin(t) - 6, h = g.bottom - mb.top + 6 - top;
      if (avail > 100 && h > avail && pass < 2) { u *= avail / h; continue; }
      mini.style.setProperty("--maq-h", Math.round(h) + "px");
      mini.style.setProperty("--nudge", Math.round(-top - (h - mb.height) / 2) + "px");
      break;
    }
  }
  function roomPoint(id) {
    var f = mini.querySelector(".m-room--" + id + " .m-floor").getBoundingClientRect();
    var v = visual.getBoundingClientRect();
    return { x: f.left + f.width / 2 - v.left, y: f.top + f.height * 0.45 - v.top };
  }
  function tapAt(p) {
    finger.style.left = p.x + "px"; finger.style.top = p.y + "px"; finger.style.opacity = 1;
    finger.classList.remove("is-tap"); void finger.offsetWidth; finger.classList.add("is-tap");
  }
  function say(text, p) {
    bubble.textContent = text;
    bubble.style.left = p.x + "px"; bubble.style.top = p.y + "px";
    bubble.classList.add("is-on");
  }
  function quiet() {
    finger.style.opacity = 0; bubble.classList.remove("is-on");
    if (!mini) return;
    mini.querySelectorAll(".is-demo").forEach(function (n) { n.classList.remove("is-demo"); });
    modelBox.classList.remove("is-wing-1", "is-wing-2");
    mini.firstChild.getAnimations().forEach(function (a) { a.cancel(); });
  }

  /* ---------- Scene scripts ---------- */
  function wings() {
    modelBox.classList.remove("is-wing-1", "is-wing-2");
    later(function () { modelBox.classList.add("is-wing-1"); }, 500);
    later(function () { modelBox.classList.remove("is-wing-1"); modelBox.classList.add("is-wing-2"); }, 2300);
    later(function () { modelBox.classList.add("is-wing-1"); }, 4100);
    if (!calm.matches) later(wings, 6200);
  }
  function howTo() {
    var p = roomPoint("bugis"), room = mini.querySelector(".m-room--bugis"), cam = mini.firstChild;
    if (calm.matches) { room.classList.add("is-demo"); say(touch ? "Tap to preview, tap again to enter" : "Point to preview, click to enter", p); return; }
    later(function () { tapAt(p); room.classList.add("is-demo"); say(touch ? "Tap once to preview" : "Point to preview", p); }, 500);
    later(function () { tapAt(p); say(touch ? "Tap again to step inside" : "Click to step inside", p); }, 2300);
    later(function () {
      bubble.classList.remove("is-on"); finger.style.opacity = 0;
      var c = cam.getBoundingClientRect(), f = room.querySelector(".m-floor").getBoundingClientRect();
      cam.style.transformOrigin = (f.left + f.width / 2 - c.left) + "px " + (f.top + f.height / 2 - c.top) + "px";
      cam.animate([{ transform: "none", opacity: 1 }, { transform: "rotate(20deg) scale(2.6)", opacity: 1, offset: .75 }, { transform: "rotate(20deg) scale(3)", opacity: 0 }],
        { duration: 1500, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" });
    }, 3200);
    later(function () { quiet(); }, 4900);
    later(howTo, 5300);
  }
  function inside() {
    var cta = intro.querySelector(".intro__card-cta");
    function loop() {
      var c = cta.getBoundingClientRect(), v = visual.getBoundingClientRect();
      tapAt({ x: c.left + c.width * 0.72 - v.left, y: c.top + c.height / 2 - v.top });
      later(function () { finger.style.opacity = 0; }, 900);
      if (!calm.matches) later(loop, 3200);
    }
    later(loop, 1700);
  }

  function go(n) {
    clear(); quiet();
    scene = n;
    intro.dataset.scene = n;
    steps.forEach(function (s) { s.classList.toggle("is-active", +s.dataset.introStep === n); });
    dots.forEach(function (d, i) { d.classList.toggle("is-on", i === n); });
    next.textContent = n === 0 ? "Begin" : n < LAST ? "Next" : "Enter the exhibition";
    if (n === 1 || n === 2) { buildMini(); requestAnimationFrame(fitMini); }
    if (n === 1) later(wings, 300);
    if (n === 2) later(howTo, 500);
    if (n === 3) inside();
  }

  function show(from) {
    lastFocus = document.activeElement;
    intro.hidden = false;
    intro.classList.remove("is-leaving");
    root.removeAttribute("data-first-visit");
    outside.forEach(function (n) { if (n) n.inert = true; });
    go(from || 0);
    intro.focus({ preventScroll: true });
  }
  function finish(toScroll) {
    clear(); quiet();
    seen(true);
    outside.forEach(function (n) { if (n) n.inert = false; });
    if (toScroll) {
      intro.hidden = true;
      var b = document.querySelector('[data-view-set="scroll"]');
      if (b) b.click();
      return;
    }
    if (calm.matches) { intro.hidden = true; window.DRMap.refit(); return; }
    intro.classList.add("is-leaving");
    setTimeout(function () {
      intro.hidden = true;
      intro.classList.remove("is-leaving");
      window.scrollTo(0, 0);
      window.DRMap.arrive();
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }, 650);
  }

  next.addEventListener("click", function () { if (scene < LAST) go(scene + 1); else finish(); });
  intro.querySelector("[data-intro-skip]").addEventListener("click", function () { finish(); });
  intro.querySelector("[data-intro-scroll]").addEventListener("click", function () { finish(true); });
  intro.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); finish(); }
    if (e.key === "ArrowRight" && scene < LAST) go(scene + 1);
    if (e.key === "ArrowLeft" && scene > 0) go(scene - 1);
  });
  var how = document.querySelector("[data-intro-open]");
  if (how) how.addEventListener("click", function () { show(1); });
  window.addEventListener("resize", function () { if (!intro.hidden && mini && (scene === 1 || scene === 2)) fitMini(); });

  /* First visit to the map, arriving without a room link: open with the landing. */
  var deep = location.hash.length > 1;
  if (root.dataset.view === "map" && !deep && !seen()) show(0);
  else root.removeAttribute("data-first-visit");
})();
