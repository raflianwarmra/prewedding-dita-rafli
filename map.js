/* Map view: a paper maquette of the gallery (CSS 3D), room pages, history and small delights. */
(function () {
  "use strict";
  var root = document.documentElement;
  var ORDER = ["bugis", "jawa", "palembang", "woven", "projection", "peranakan", "bappenas", "out-of-character", "film"];
  var ROOMS = 8; /* the cinema is the epilogue, not counted as a room */

  /* Footprint in model units. x grows to the right, y towards the entrance. */
  var W = 8.8, D = 17.6, HALL_X = 4.4;
  var MODEL = [
    { id: "palembang", no: "03", name: "Palembang", x: 0, y: 0, w: 3.4, d: 5, side: "left", walls: "new", n: ["palembang-1", "palembang-2"], e: ["palembang-3"] },
    { id: "jawa", no: "02", name: "Jawa", x: 0, y: 5, w: 3.4, d: 5, side: "left", walls: "new", n: ["jawa-1", "jawa-3"], e: ["jawa-2"] },
    { id: "bugis", no: "01", name: "Bugis-Makassar", x: 0, y: 10, w: 3.4, d: 5, side: "left", walls: "new", n: ["bugis-1", "bugis-4"], e: ["bugis-2"] },
    { id: "out-of-character", no: "08", name: "Out of Character", x: 5.4, y: 0, w: 3.4, d: 3, side: "right", walls: "new", n: ["ooc-1", "ooc-3"], e: ["ooc-2"] },
    { id: "bappenas", no: "07", name: "Bappenas, Menteng", x: 5.4, y: 3, w: 3.4, d: 3, side: "right", walls: "new", n: ["bappenas-1", "bappenas-3"], e: ["bappenas-2"] },
    { id: "peranakan", no: "06", name: "Peranakan", x: 5.4, y: 6, w: 3.4, d: 3, side: "right", walls: "new", n: ["peranakan-1", "peranakan-2"], e: ["peranakan-4"] },
    { id: "projection", no: "05", name: "Projection of Our Roots", x: 5.4, y: 9, w: 3.4, d: 3, side: "right", walls: "new", n: ["projection-3", "projection-4"], e: ["projection-1"], glyph: "ᨀ ꦲ ᨁ" },
    { id: "woven", no: "04", name: "Woven Together", x: 5.4, y: 12, w: 3.4, d: 3, side: "right", walls: "new", n: ["woven-2", "woven-3"], e: ["woven-4"] },
    { id: "film", no: "", name: "Cinema", x: 3.4, y: 0, w: 2, d: 3, side: "hall", walls: "n", n: ["film"], wide: true }
  ];

  var SUB = { bugis: "Rafli's roots", jawa: "From her mother", palembang: "From her father", woven: "Traditional contemporary I", projection: "Traditional contemporary II", peranakan: "A shared appreciation", bappenas: "Where it began", "out-of-character": "Mid-century", film: "Epilogue: In Motion" };
  var mapview = document.querySelector(".mapview");
  var maq = document.querySelector("[data-maq]");
  var camera = document.querySelector("[data-camera]");
  var scene = document.querySelector("[data-scene]");
  var dialog = document.querySelector("[data-roomview]");
  var body = dialog.querySelector("[data-body]");
  var title = dialog.querySelector("#roomview-title");
  var prevName = dialog.querySelector("[data-prev-name]");
  var nextName = dialog.querySelector("[data-next-name]");
  var progress = document.querySelector("[data-progress]");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var current = null, flight = null, u = 26;
  var byId = {};
  MODEL.forEach(function (m) { byId[m.id] = m; });

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }
  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }
  function label(id) { var m = byId[id]; return m.no ? m.no + " · " + m.name : m.name; }

  /* ---------- Build the model ---------- */
  function box(cls, x, y, w, d) {
    var r = el("div", "m-room " + cls);
    r.style.cssText = "--x:" + x + ";--y:" + y + ";--w:" + w + ";--d:" + d;
    return r;
  }
  function wall(side, extra) { return el("div", "m-wall m-wall--" + side + (extra ? " " + extra : "")); }
  function print(name) {
    var p = el("span", "m-print");
    var img = new Image();
    img.src = "assets/photos/" + name + "-360.webp";
    img.alt = ""; img.decoding = "async"; img.width = 360; img.height = 450;
    p.appendChild(img);
    return p;
  }

  var tags = el("div", "maq__tags");
  camera.appendChild(tags);
  var entrance = el("span", "m-tag m-tag--entrance", "Entrance");
  entrance.setAttribute("aria-hidden", "true");
  tags.appendChild(entrance);
  scene.appendChild(el("div", "m-ground"));

  var hall = box("m-hall", 3.4, 3, 2, 12);
  hall.appendChild(el("div", "m-floor"));
  hall.appendChild(el("span", "m-path"));
  scene.appendChild(hall);

  var lobby = box("m-lobby", 0, 15, W, 2.6);
  lobby.appendChild(el("div", "m-floor"));
  lobby.appendChild(el("span", "m-mono", '<svg viewBox="0 0 1275.59 1275.59"><use href="#monogram"/></svg>'));
  var ln1 = wall("n"); ln1.style.cssText = "width:" + (3.4 / W * 100) + "%";
  var ln2 = wall("n"); ln2.style.cssText = "left:auto;right:0;width:" + (3.4 / W * 100) + "%";
  lobby.appendChild(ln1); lobby.appendChild(ln2);
  lobby.appendChild(wall("e")); lobby.appendChild(wall("w")); lobby.appendChild(wall("s", "is-split"));
  scene.appendChild(lobby);

  MODEL.forEach(function (m) {
    var r = box("m-room--" + m.id, m.x, m.y, m.w, m.d);
    r.dataset.room = m.id;
    var floor = el("button", "m-floor");
    floor.type = "button";
    floor.dataset.room = m.id;
    floor.setAttribute("aria-label", m.id === "film" ? "Cinema, epilogue: In Motion" : "Room " + m.no + ", " + m.name);
    r.appendChild(floor);
    r.appendChild(el("span", "m-num", m.no || "&#9654;"));
    if (m.glyph) r.appendChild(el("span", "m-glyph", m.glyph));
    if (m.walls.indexOf("n") !== -1) { var n = wall("n"); (m.n || []).forEach(function (p) { n.appendChild(print(p)); }); r.appendChild(n); }
    if (m.walls.indexOf("e") !== -1) { var e = wall("e"); (m.e || []).forEach(function (p) { e.appendChild(print(p)); }); r.appendChild(e); }
    if (m.walls.indexOf("w") !== -1) r.appendChild(wall("w"));
    scene.appendChild(r);
    m.el = r;
  });

  var you = el("span", "m-you");
  you.setAttribute("aria-hidden", "true");
  scene.appendChild(you);

  /* ---------- Fit the model to its container ---------- */
  var SPIN = -20, TILT = 48;
  function rad(a) { return a * Math.PI / 180; }
  function fit() {
    var desktop = window.matchMedia("(min-width: 1024px)").matches;
    var s = rad(Math.abs(SPIN)), t = rad(TILT);
    var extX = W * Math.cos(s) + D * Math.sin(s) + 1.8;
    u = Math.max(18, Math.min(maq.clientWidth / extX, 44));
    var room = window.innerHeight - 56 - 40;
    for (var pass = 0; pass < 3; pass++) {
      maq.style.setProperty("--u", u + "px");
      maq.style.setProperty("--nudge", "0px");
      maq.style.setProperty("--maq-h", "900px");
      /* Measure the rendered model and trim the frame to it: back walls above, entrance caption below. */
      var g = scene.querySelector(".m-ground").getBoundingClientRect(), mb = maq.getBoundingClientRect();
      var top = g.top - mb.top - 1.3 * u * Math.sin(t) - 8;
      var bottom = g.bottom - mb.top + 30;
      var newH = bottom - top;
      if (desktop && newH > room && pass < 2) { u = Math.max(18, u * room / newH); continue; }
      maq.style.setProperty("--maq-h", Math.round(newH) + "px");
      /* The scene is centred, so resizing the frame moves it by half the change. */
      maq.style.setProperty("--nudge", Math.round(-top - (newH - mb.height) / 2) + "px");
      break;
    }
    placeHere();
    pinTags();
  }

  /* The entrance caption sits in a flat layer, pinned under the lobby. */
  function pinTags() {
    if (flight) return;
    var c = camera.getBoundingClientRect(), lr = lobby.getBoundingClientRect();
    entrance.style.left = (lr.left + lr.width / 2 - c.left) + "px";
    entrance.style.top = (lr.bottom - c.top + 10) + "px";
  }

  /* ---------- Pointer tilt (desktop only) ---------- */
  var tgt = { s: SPIN, t: TILT }, now = { s: SPIN, t: TILT }, raf = 0;
  function tick() {
    now.s += (tgt.s - now.s) * 0.08;
    now.t += (tgt.t - now.t) * 0.08;
    scene.style.setProperty("--spin", now.s.toFixed(2) + "deg");
    scene.style.setProperty("--tilt", now.t.toFixed(2) + "deg");
    pinTags();
    raf = Math.abs(tgt.s - now.s) + Math.abs(tgt.t - now.t) > 0.02 ? requestAnimationFrame(tick) : 0;
  }
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    maq.addEventListener("pointermove", function (e) {
      if (calm.matches || flight) return;
      var b = maq.getBoundingClientRect();
      tgt.s = SPIN + ((e.clientX - b.left) / b.width - 0.5) * 7;
      tgt.t = TILT - ((e.clientY - b.top) / b.height - 0.5) * 5;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    maq.addEventListener("pointerleave", function () { tgt.s = SPIN; tgt.t = TILT; if (!raf) raf = requestAnimationFrame(tick); });
  }

  /* ---------- Views: Map | Scroll ---------- */
  var viewButtons = document.querySelectorAll("[data-view-set]");
  function setView(view, fromLoad) {
    root.dataset.view = view;
    viewButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.viewSet === view)); });
    if (fromLoad) return;
    if (dialog.open) closeNow();
    var url = new URL(location.href);
    url.hash = "";
    if (view === "scroll") url.searchParams.set("view", "scroll"); else url.searchParams.delete("view");
    history.replaceState(null, "", url);
    window.scrollTo(0, 0);
    if (view === "map") fit();
  }
  viewButtons.forEach(function (b) {
    b.addEventListener("click", function () { if (root.dataset.view !== b.dataset.viewSet) setView(b.dataset.viewSet); });
  });
  setView(root.dataset.view, true);

  /* ---------- Visits and the "you are here" dot ---------- */
  var visited = store("dr-visited") || [];
  function paintVisits() {
    ORDER.forEach(function (id) {
      var seen = visited.indexOf(id) !== -1;
      byId[id].el.classList.toggle("is-visited", seen);
      document.querySelectorAll('.roomlist [data-room="' + id + '"]').forEach(function (b) { b.classList.toggle("is-visited", seen); });
    });
    var count = visited.filter(function (id) { return id !== "film"; }).length;
    progress.classList.toggle("is-complete", count >= ROOMS);
    progress.textContent = count === 0 ? "" :
      count >= ROOMS ? "You have visited every room. Thank you for coming." :
      count + " of " + ROOMS + " rooms visited";
  }
  function markVisited(id) {
    if (visited.indexOf(id) === -1) { visited.push(id); store("dr-visited", visited); }
    store("dr-here", id);
    paintVisits();
  }

  var here = store("dr-here");
  function door(id) { /* a point in the hall outside the room's door, in model units */
    if (!id) return { x: HALL_X, y: 16.9 };
    var m = byId[id];
    if (m.id === "film") return { x: HALL_X, y: 3.4 };
    return { x: m.side === "left" ? 3.75 : 5.05, y: m.y + m.d / 2 };
  }
  function at(p) { return { transform: "translate(" + (p.x * u) + "px," + (p.y * u) + "px) translateZ(2px)" }; }
  function placeHere() { you.style.transform = at(door(here)).transform; }
  function walkTo(id) {
    var from = door(here), to = door(id);
    here = id;
    placeHere();
    if (calm.matches || !you.animate) return;
    you.animate([at(from), at({ x: HALL_X, y: from.y }), at({ x: HALL_X, y: to.y }), at(to)], { duration: 600, easing: "cubic-bezier(.45,0,.2,1)" });
  }

  /* ---------- Camera ---------- */
  function flyTo(id) {
    if (calm.matches || !camera.animate) return Promise.resolve();
    var r = byId[id].el.querySelector(".m-floor").getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return Promise.resolve(); /* model is off-screen */
    var c = camera.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var k = Math.min(3.4, Math.max(1.8, window.innerWidth * 0.7 / r.width));
    camera.style.transformOrigin = (cx - c.left) + "px " + (cy - c.top) + "px";
    maq.classList.add("is-flying");
    mapview.classList.add("is-flying");
    flight = camera.animate([
      { transform: "none" },
      { transform: "translate(" + (window.innerWidth / 2 - cx) + "px," + (window.innerHeight / 2 - cy) + "px) scale(" + k + ")" }
    ], { duration: 680, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" });
    return new Promise(function (res) { setTimeout(res, 470); }); /* open the room as the camera arrives */
  }
  function flyBack() {
    if (!flight) return;
    var f = flight;
    flight = null;
    f.updatePlaybackRate(1.35);
    f.reverse();
    f.finished.then(function () { f.cancel(); camera.style.transformOrigin = ""; maq.classList.remove("is-flying"); mapview.classList.remove("is-flying"); pinTags(); }).catch(function () {});
  }

  /* ---------- Room page ---------- */
  function render(id) {
    var copy = document.getElementById(id).cloneNode(true);
    copy.removeAttribute("id");
    copy.removeAttribute("aria-labelledby");
    copy.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
    copy.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-in"); });
    copy.querySelectorAll('img[loading="lazy"]').forEach(function (img, i) { if (i < 3) img.loading = "eager"; });
    body.replaceChildren(copy);
    dialog.scrollTop = 0;
    current = id;
    title.textContent = id === "film" ? "Epilogue · In Motion" : "Room " + label(id);
    var i = ORDER.indexOf(id);
    prevName.textContent = i > 0 ? label(ORDER[i - 1]) : "Back to the map";
    nextName.textContent = i < ORDER.length - 1 ? label(ORDER[i + 1]) : "Back to the map";
    markVisited(id);
  }
  function urlFor(id) { var url = new URL(location.href); url.hash = id ? "#" + id : ""; return url; }

  var opening = false;
  function open(id, push) {
    if (opening || dialog.open) return;
    opening = true;
    if (push) history.pushState({ room: id }, "", urlFor(id));
    byId[id].el.classList.add("is-hot");
    walkTo(id);
    flyTo(id).then(function () {
      byId[id].el.classList.remove("is-hot");
      render(id);
      dialog.classList.remove("is-closing");
      dialog.showModal();
      dialog.querySelector("[data-close]").focus({ preventScroll: true });
      opening = false;
    });
  }
  function closeNow() {
    var id = current;
    var finish = function () {
      dialog.close();
      dialog.classList.remove("is-closing");
      body.replaceChildren();
      current = null;
      flyBack();
      var f = id && byId[id].el.querySelector(".m-floor");
      if (f && root.dataset.view === "map") f.focus({ preventScroll: true });
    };
    if (!dialog.open) { flyBack(); return; }
    if (calm.matches) { finish(); return; }
    dialog.classList.add("is-closing");
    setTimeout(finish, 200);
  }
  function close() {
    if (history.state && history.state.room) history.back();
    else { history.replaceState(null, "", urlFor("")); closeNow(); }
  }
  function step(dir) {
    var i = ORDER.indexOf(current) + dir;
    if (i < 0 || i >= ORDER.length) { close(); return; }
    var id = ORDER[i];
    history.replaceState({ room: id }, "", urlFor(id));
    here = id;
    placeHere();
    select(id);
    if (document.startViewTransition && !calm.matches) document.startViewTransition(function () { render(id); });
    else render(id);
  }

  /* ---------- Selection and the wall-label card ---------- */
  var card = document.querySelector("[data-card]");
  var cardPrints = card.querySelector("[data-card-prints]");
  var selected = null;
  function select(id) {
    if (selected === id) return;
    if (selected) byId[selected].el.classList.remove("is-selected");
    selected = id;
    var m = byId[id];
    m.el.classList.add("is-selected");
    card.querySelector("[data-card-wing]").textContent = m.side === "left" ? "Wing I · Adat" : m.side === "right" ? "Wing II · Non-Adat" : "The cinema";
    card.querySelector("[data-card-no]").textContent = m.no ? "Room " + m.no : "Epilogue";
    card.querySelector("[data-card-name]").textContent = m.id === "film" ? "In Motion" : m.name;
    card.querySelector("[data-card-sub]").textContent = m.id === "film" ? "Our prewedding film" : SUB[id];
    var names = (m.n || []).concat(m.e || []);
    if (id === "film") names = ["film", "ooc-1", "ooc-4"];
    cardPrints.classList.remove("is-swapping");
    cardPrints.replaceChildren.apply(cardPrints, names.slice(0, 3).map(function (n) {
      var img = new Image(); img.src = "assets/photos/" + n + "-360.webp"; img.alt = ""; img.width = 360; img.height = 450; img.decoding = "async";
      return img;
    }));
    void cardPrints.offsetWidth;
    cardPrints.classList.add("is-swapping");
    card.querySelector("[data-enter]").setAttribute("aria-label", "Enter " + (m.no ? "room " + m.no + ", " + m.name : "the cinema"));
  }
  card.querySelectorAll("[data-card-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      var i = (ORDER.indexOf(selected) + +b.dataset.cardStep + ORDER.length) % ORDER.length;
      select(ORDER[i]);
    });
  });
  card.querySelector("[data-enter]").addEventListener("click", function () { open(selected, true); });

  /* On the model: first tap selects, second tap enters. The text list enters directly. */
  /* Screen point -> model units on the floor plane (orthographic, so a 2x2 inverse is enough). */
  function roomAt(sx, sy) {
    var m = new DOMMatrix(getComputedStyle(scene).transform);
    var c = camera.getBoundingClientRect();
    var ox = c.left + scene.offsetLeft + scene.offsetWidth / 2, oy = c.top + scene.offsetTop + scene.offsetHeight / 2;
    var px = sx - ox - m.m41, py = sy - oy - m.m42, det = m.m11 * m.m22 - m.m21 * m.m12;
    var x = (m.m22 * px - m.m21 * py) / det, y = (m.m11 * py - m.m12 * px) / det;
    x = (x + scene.offsetWidth / 2) / u; y = (y + scene.offsetHeight / 2) / u;
    for (var i = 0; i < MODEL.length; i++) {
      var r = MODEL[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.d) return r.id;
    }
    return null;
  }
  maq.addEventListener("click", function (e) {
    var t = e.target.closest("[data-room]");
    var id = t ? t.dataset.room : roomAt(e.clientX, e.clientY);
    if (!id) return;
    if (selected === id) open(selected, true); else select(id);
  });
  document.querySelector(".roomlist").addEventListener("click", function (e) {
    var t = e.target.closest("[data-room]");
    if (t) { select(t.dataset.room); open(t.dataset.room, true); }
  });
  if (window.matchMedia("(hover: hover)").matches) {
    scene.addEventListener("pointerover", function (e) {
      var t = e.target.closest("[data-room]");
      if (t) select(t.dataset.room);
    });
  }
  dialog.querySelector("[data-close]").addEventListener("click", close);
  dialog.querySelectorAll("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () { step(+b.dataset.step); });
  });
  dialog.addEventListener("cancel", function (e) { e.preventDefault(); close(); });

  window.addEventListener("popstate", function () {
    if (root.dataset.view !== "map") return;
    var id = location.hash.slice(1);
    if (ORDER.indexOf(id) !== -1) {
      select(id);
      if (dialog.open) render(id); else open(id, false);
    } else if (dialog.open) {
      closeNow();
    }
  });

  /* ---------- Start ---------- */
  paintVisits();
  select(here && byId[here] ? here : "bugis");
  fit();
  if (document.fonts) document.fonts.ready.then(pinTags);
  var resizeTimer;
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(fit, 120); });

  /* Deep link (#jawa): open it, with the map underneath for Back. */
  var start = location.hash.slice(1);
  if (root.dataset.view === "map" && ORDER.indexOf(start) !== -1) {
    history.replaceState(null, "", urlFor(""));
    history.pushState({ room: start }, "", urlFor(start));
    here = start;
    placeHere();
    render(start);
    dialog.showModal();
  }
})();
