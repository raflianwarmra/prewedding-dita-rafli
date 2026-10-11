/* Map view: a paper maquette of the gallery (CSS 3D), room pages, history and small delights. */
(function () {
  "use strict";
  var root = document.documentElement;
  var ORDER = ["bugis", "jawa", "palembang", "woven", "projection", "peranakan", "bappenas", "out-of-character", "film"];
  var ROOMS = 8; /* the cinema is the epilogue, not counted as a room */

  /* Footprint in model units. x grows to the right, y towards the entrance. */
  var W = 9.2, D = 17.6, HALL_X = 4.6;   /* the centre aisle is 2.4 units wide */
  var EDGE = 2.2;   /* plinth margin outside each wing, where numbers and wing names are painted */
  var MODEL = [
    { id: "palembang", no: "03", name: "Palembang", x: 0, y: 0, w: 3.4, d: 5, side: "left", walls: "new", n: ["palembang-1", "palembang-2"], e: ["palembang-3"] },
    { id: "jawa", no: "02", name: "Jawa", x: 0, y: 5, w: 3.4, d: 5, side: "left", walls: "new", n: ["jawa-1", "jawa-3"], e: ["jawa-2"] },
    { id: "bugis", no: "01", name: "Bugis-Makassar", x: 0, y: 10, w: 3.4, d: 5, side: "left", walls: "new", n: ["bugis-1", "bugis-4"], e: ["bugis-2"] },
    { id: "out-of-character", no: "08", name: "Out of Character", x: 5.8, y: 0, w: 3.4, d: 3, side: "right", walls: "new", n: ["ooc-1", "ooc-3"], e: ["ooc-2"] },
    { id: "bappenas", no: "07", name: "Bappenas, Menteng", x: 5.8, y: 3, w: 3.4, d: 3, side: "right", walls: "new", n: ["bappenas-1", "bappenas-3"], e: ["bappenas-2"] },
    { id: "peranakan", no: "06", name: "Peranakan", x: 5.8, y: 6, w: 3.4, d: 3, side: "right", walls: "new", n: ["peranakan-1", "peranakan-2"], e: ["peranakan-4"] },
    { id: "projection", no: "05", name: "Projection of Our Roots", x: 5.8, y: 9, w: 3.4, d: 3, side: "right", walls: "new", n: ["projection-3", "projection-4"], e: ["projection-1"], glyph: "ᨀ ꦲ ᨁ" },
    { id: "woven", no: "04", name: "Woven Together", x: 5.8, y: 12, w: 3.4, d: 3, side: "right", walls: "new", n: ["woven-2", "woven-3"], e: ["woven-4"] },
    { id: "film", no: "", name: "Cinema", x: 2.4, y: -7.2, w: 4.4, d: 4.2, side: "hall", walls: "news", n: ["film"], theatre: true }
  ];

  function T(k, v) { return window.I18N ? I18N.t(k, v) : k; }
  function sub(id) { return T("sub." + id); }
  var SHORT = { projection: "Projection", bappenas: "Bappenas" };
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
  function label(id) { var m = byId[id]; return m.no ? m.no + " · " + m.name : T("cinema"); }
  function enterLabel(id) { return id === "film" ? T("enter.film") : T("enter.room", { name: SHORT[id] || byId[id].name }); }

  /* ---------- Build the model ---------- */
  function box(cls, x, y, w, d) {
    var r = el("div", "m-room " + cls);
    r.style.cssText = "--x:" + x + ";--y:" + y + ";--w:" + w + ";--d:" + d;
    return r;
  }
  function flat(cls, x, y, w, d, html) {
    var f = el("div", "m-flat " + cls, html);
    f.style.cssText = "--x:" + x + ";--y:" + y + ";--w:" + w + ";--d:" + d;
    return f;
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
  /* Plinths and painted labels are drawn inside the ground plate itself, so no browser has to
     depth-sort nearly coplanar layers (iOS Safari hid the second plinth when they were separate). */
  var ground = el("div", "m-ground");
  scene.appendChild(ground);
  ground.appendChild(flat("m-plinth m-plinth--1", -EDGE, -0.45, EDGE + 3.4, 15.45));
  ground.appendChild(flat("m-plinth m-plinth--2", 5.8, -0.45, EDGE + 3.4, 15.45));
  /* The cinema is its own building at the end of the aisle, on a velvet plinth with a marquee. */
  ground.appendChild(flat("m-walk", 3.5, -2.2, 2.2, 2.3));   /* path from the aisle to the cinema door */
  ground.appendChild(flat("m-plinth m-plinth--cinema", 2.0, -8, 5.2, 5.85));
  var marquee = flat("m-paint m-marquee", 2.0, -2.95, 5.2, 0.75, "<span></span>");
  ground.appendChild(marquee);
  var wingName1 = flat("m-paint m-wingname m-wingname--1", -EDGE + 0.05, 0, 0.9, 15, "<span></span>");
  var wingName2 = flat("m-paint m-wingname m-wingname--2", W + EDGE - 0.95, 0, 0.9, 15, "<span></span>");
  ground.appendChild(wingName1); ground.appendChild(wingName2);
  var entrance = flat("m-paint m-entrance", 0, D + 0.25, W, 1, "<span></span>");
  ground.appendChild(entrance);
  function paintNames() {
    wingName1.firstChild.textContent = T("wing1.paint");
    wingName2.firstChild.textContent = T("wing2.paint");
    entrance.firstChild.textContent = T("entrance");
    marquee.firstChild.textContent = "In Motion";
  }
  paintNames();

  var hall = box("m-hall", 3.4, 0, 2.4, 15);
  hall.appendChild(el("div", "m-floor"));
  hall.appendChild(el("span", "m-path"));
  scene.appendChild(hall);

  var lobby = box("m-lobby", 0, 15, W, 2.6);
  lobby.appendChild(el("div", "m-floor"));
  lobby.appendChild(el("span", "m-mono", '<svg viewBox="0 0 1275.59 1275.59"><use href="#monogram"/></svg>'));
  var ln1 = wall("n"); ln1.style.cssText = "width:" + (3.4 / W * 100) + "%";
  var ln2 = wall("n"); ln2.style.cssText = "left:auto;right:0;width:" + (3.4 / W * 100) + "%";   /* the aisle stays open */
  lobby.appendChild(ln1); lobby.appendChild(ln2);
  lobby.appendChild(wall("e")); lobby.appendChild(wall("w")); lobby.appendChild(wall("s", "is-split"));
  scene.appendChild(lobby);

  MODEL.forEach(function (m) {
    var r = box("m-room--" + m.id, m.x, m.y, m.w, m.d);
    r.dataset.room = m.id;
    r.dataset.wing = m.side === "left" ? "1" : m.side === "right" ? "2" : "0";
    var floor = el("button", "m-floor");
    floor.type = "button";
    floor.dataset.room = m.id;
    floor.setAttribute("aria-label", m.id === "film" ? T("aria.film") : T("aria.floor", { no: m.no, name: m.name }));
    r.appendChild(floor);
    if (m.no) { m.noEl = flat("m-paint m-no m-no--" + m.side, m.side === "left" ? -1.15 : W + 0.25, m.y + m.d / 2 - 0.45, 0.9, 0.9, m.no); ground.appendChild(m.noEl); }
    else r.appendChild(el("span", "m-num", "&#9654;"));
    if (m.glyph) r.appendChild(el("span", "m-glyph", m.glyph));
    if (m.walls.indexOf("n") !== -1) { var n = wall("n"); (m.n || []).forEach(function (p) { n.appendChild(print(p)); }); r.appendChild(n); }
    if (m.walls.indexOf("e") !== -1) { var e = wall("e"); (m.e || []).forEach(function (p) { e.appendChild(print(p)); }); r.appendChild(e); }
    if (m.walls.indexOf("w") !== -1) r.appendChild(wall("w"));
    if (m.walls.indexOf("s") !== -1) r.appendChild(wall("s", "is-split"));
    if (m.theatre) { r.appendChild(el("span", "m-seats")); r.appendChild(el("span", "m-screenglow")); }
    scene.appendChild(r);
    m.el = r;
  });

  var you = el("span", "m-you");
  you.setAttribute("aria-hidden", "true");
  scene.appendChild(you);

  /* ---------- Fit the model to its container ---------- */
  var SPIN = -12, TILT = 48;
  function rad(a) { return a * Math.PI / 180; }
  function fit() {
    var desktop = window.matchMedia("(min-width: 1024px)").matches;
    var s = rad(Math.abs(SPIN)), t = rad(TILT);
    var extX = (W + 2 * EDGE + 0.4) * Math.cos(s) + (D + 9) * Math.sin(s);   /* includes the theatre behind */
    u = Math.max(18, Math.min(maq.clientWidth / extX, 44));
    var room = window.innerHeight - 56 - 40;
    for (var pass = 0; pass < 3; pass++) {
      maq.style.setProperty("--u", u + "px");
      maq.style.setProperty("--nudge", "0px");
      maq.style.setProperty("--shift", "0px");
      maq.style.setProperty("--maq-h", "900px");
      /* Measure the rendered model and trim the frame to it: back walls above, entrance caption below. */
      var g = scene.querySelector(".m-ground").getBoundingClientRect(), mb = maq.getBoundingClientRect();
      /* WebKit can report a nonsense box for the 3D plate in the frame it becomes visible: measure again next frame. */
      if (!(g.height > 0 && g.height < window.innerHeight * 6 && Math.abs(g.top - mb.top) < 3000)) {
        if ((fit.retries = (fit.retries || 0) + 1) < 8) requestAnimationFrame(fit);
        return;
      }
      fit.retries = 0;
      if (g.width > mb.width - 4 && pass < 2) { u = Math.max(12, u * (mb.width - 8) / g.width); continue; }
      maq.style.setProperty("--shift", Math.round(mb.left + mb.width / 2 - (g.left + g.width / 2)) + "px");
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

  /* The entrance caption and the tap hint sit in a flat layer above the model. */
  var hint = el("span", "m-hint"), hintDot = el("span", "m-hint-dot");
  hint.setAttribute("aria-hidden", "true"); hintDot.setAttribute("aria-hidden", "true");
  tags.appendChild(hintDot); tags.appendChild(hint);
  var touch = window.matchMedia("(hover: none)").matches;
  var learned = !!store("dr-learned");
  var hintMode = "off";   /* the panel says "tap a room"; the floating hint only explains the second tap */
  function pinTags() {
    if (flight) return;
    placeHint(camera.getBoundingClientRect());
  }
  function placeHint(c) {
    var on = hintMode !== "off" && selected && root.dataset.view === "map";
    hint.classList.toggle("is-on", !!on); hintDot.classList.toggle("is-on", !!on);
    if (!on) return;
    c = c || camera.getBoundingClientRect();
    var r = byId[selected].el.querySelector(".m-floor").getBoundingClientRect();
    var x = r.left + r.width / 2 - c.left, y = r.top + r.height * 0.42 - c.top;
    hint.textContent = T("hint." + hintMode + (touch ? ".touch" : ".mouse"));
    hint.style.left = x + "px"; hint.style.top = y + "px";
    hintDot.style.left = x + "px"; hintDot.style.top = y + "px";
  }
  function setHint(mode) { if (!learned) { hintMode = mode; placeHint(); } }

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
    if (view === "map") { fit(); layoutSheet(); }
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
    progress.textContent = count === 0 ? "" : count >= ROOMS ? T("progress.done") : T("progress", { n: count });
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
    if (m.id === "film") return { x: HALL_X, y: -2.5 };
    return { x: m.side === "left" ? 3.75 : 5.45, y: m.y + m.d / 2 };
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

  /* ---------- Entry state ----------
     Every entry, exit and room change gets a generation number. Anything that starts a new one
     (Close, Back, Prev/Next) bumps it, and the older chain stops at its next step. Nothing locks input. */
  var gen = 0, phase = null, entries = 0, skipper = null;
  var CANCEL = {};
  function live(my) { if (my !== gen) throw CANCEL; }
  function quiet(err) { if (err !== CANCEL) throw err; }
  function wait(ms) {
    return new Promise(function (res) {
      var t = setTimeout(res, ms);
      skipper = function () { clearTimeout(t); res(); };
    });
  }
  /* The first room of a visit gets the full entrance; after that, a shorter one. */
  function dur(first, later) { return entries > 1 ? later : first; }

  /* ---------- Camera ---------- */
  function flyTo(id) {
    if (calm.matches || !camera.animate) return Promise.resolve();
    var r = byId[id].el.querySelector(".m-floor").getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return Promise.resolve(); /* model is off-screen */
    var FLY = dur(1350, 820);
    var c = camera.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var k = Math.min(6.5, Math.max(2.6, window.innerWidth * 1.15 / r.width));
    camera.style.transformOrigin = (cx - c.left) + "px " + (cy - c.top) + "px";
    maq.classList.add("is-flying");
    mapview.classList.add("is-flying");
    /* Glide towards the room and turn to square up with it, like walking through its door. */
    flight = camera.animate([
      { transform: "translate(0,0) rotate(0deg) scale(1)" },
      { transform: "translate(" + (window.innerWidth / 2 - cx) * 0.35 + "px," + (window.innerHeight / 2 - cy) * 0.35 + "px) rotate(" + (-SPIN * 0.3) + "deg) scale(" + (1 + (k - 1) * 0.18) + ")", offset: 0.4 },
      { transform: "translate(" + (window.innerWidth / 2 - cx) + "px," + (window.innerHeight / 2 - cy) + "px) rotate(" + (-SPIN) + "deg) scale(" + k + ")" }
    ], { duration: FLY, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" });
    return wait(FLY * 0.6);
  }
  /* Reverse from wherever the camera is now, so an interrupted flight turns back smoothly. */
  function flyBack() {
    if (!flight) { maq.classList.remove("is-flying"); mapview.classList.remove("is-flying"); return; }
    var f = flight;
    flight = null;
    f.updatePlaybackRate(1.15);
    f.reverse();
    f.finished.then(function () { f.cancel(); camera.style.transformOrigin = ""; maq.classList.remove("is-flying"); mapview.classList.remove("is-flying"); pinTags(); }).catch(function () {});
  }

  /* ---------- Curtain: a colour field with a title card between rooms ---------- */
  var CURTAIN = {
    bugis: ["oklch(42% 0.17 358)", "oklch(97% 0.015 80)"],
    jawa: ["oklch(33% 0.07 150)", "oklch(96% 0.02 110)"],
    palembang: ["oklch(66% 0.11 80)", "oklch(22% 0.05 60)"],
    woven: ["oklch(55% 0.16 38)", "oklch(97% 0.015 80)"],
    projection: ["oklch(12% 0.012 280)", "oklch(88% 0.12 150)"],
    peranakan: ["oklch(52% 0.12 250)", "oklch(96% 0.03 340)"],
    bappenas: ["oklch(42% 0.09 160)", "oklch(97% 0.01 160)"],
    "out-of-character": ["oklch(24% 0.05 45)", "oklch(84% 0.12 70)"],
    film: ["oklch(10% 0.02 20)", "oklch(94% 0.02 80)"]
  };
  var curtain = dialog.querySelector("[data-curtain]");
  function curtainIn(id, ms) {
    var m = byId[id], c = CURTAIN[id];
    curtain.style.setProperty("--c-bg", c[0]);
    curtain.style.setProperty("--c-ink", c[1]);
    curtain.querySelector(".curtain__no").textContent = m.no ? T("room") + " " + m.no : T("epilogue");
    curtain.querySelector(".curtain__name").textContent = id === "film" ? "In Motion" : m.name;
    curtain.querySelector(".curtain__sub").textContent = sub(id);
    curtain.classList.add("is-on");
    if (calm.matches) { curtain.style.opacity = 1; return Promise.resolve(); }
    curtain.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: "ease-out", fill: "forwards" });
    var ease = "cubic-bezier(.22,1,.36,1)", k = ms / 650;
    curtain.querySelector(".curtain__no").animate([{ opacity: 0, transform: "scale(1.12)" }, { opacity: .8, transform: "none" }], { duration: 900 * k, delay: ms * 0.3, easing: ease, fill: "both" });
    curtain.querySelector(".curtain__name").animate([{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "none" }], { duration: 900 * k, delay: ms * 0.45, easing: ease, fill: "both" });
    curtain.querySelector(".curtain__sub").animate([{ opacity: 0 }, { opacity: .85 }], { duration: 700 * k, delay: ms * 0.7, easing: ease, fill: "both" });
    curtain.querySelector(".curtain__rule").animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 800 * k, delay: ms * 0.8, easing: ease, fill: "both" });
    return wait(ms);
  }
  function curtainOut(ms) {
    if (calm.matches) { dropCurtain(); return Promise.resolve(); }
    var a = curtain.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: "ease-in-out", fill: "forwards" });
    return a.finished.then(dropCurtain);
  }
  function dropCurtain() {
    curtain.getAnimations({ subtree: true }).forEach(function (x) { x.cancel(); });
    curtain.classList.remove("is-on");
    curtain.style.opacity = 0;
  }
  /* The room arrives piece by piece once the curtain lifts. */
  function revealRoom() {
    if (calm.matches) return;
    var pieces = body.querySelectorAll(".room__plaque, .photo, .continue, .epilogue > div");
    pieces.forEach(function (p, i) {
      p.animate([{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }],
        { duration: 700, delay: 60 + Math.min(i, 6) * 60, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
    });
  }
  /* A tap while the curtain is up skips straight to the room. */
  dialog.addEventListener("pointerdown", function () {
    if (phase !== "entering" && phase !== "stepping") return;
    curtain.getAnimations({ subtree: true }).forEach(function (x) { try { x.finish(); } catch (e) {} });
    if (skipper) skipper();
  });

  /* ---------- Room page ---------- */
  function render(id) {
    var copy = document.getElementById(id).cloneNode(true);
    copy.removeAttribute("id");
    copy.removeAttribute("aria-labelledby");
    copy.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
    copy.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-in"); });
    copy.querySelectorAll('img[loading="lazy"]').forEach(function (img, i) { if (i < 3) img.loading = "eager"; });
    body.replaceChildren(copy);
    if (dialog.open) tint();
    dialog.scrollTop = 0;
    current = id;
    roomChrome(id);
    markVisited(id);
  }
  /* The room bar and page take on the room's own colour, like a material lit by the room.
     Read once the page is open (WebKit reports "transparent" for a closed dialog's contents). */
  function tint() {
    var room = body.firstElementChild;
    if (!room) return;
    var cs = getComputedStyle(room), bg = cs.backgroundColor;
    if (!bg || bg === "transparent" || /rgba\(0, 0, 0, 0\)/.test(bg)) { requestAnimationFrame(tint); return; }
    dialog.style.setProperty("--rv-tint", bg);
    dialog.style.setProperty("--rv-ink", cs.color);
  }
  function roomChrome(id) {
    var m = byId[id];
    title.innerHTML = "";
    var no = el("span", "roomview__no", id === "film" ? T("epilogue") + " · " : T("room") + " " + m.no + " · ");
    title.appendChild(no);
    title.appendChild(document.createTextNode(id === "film" ? "In Motion" : m.name));
    var i = ORDER.indexOf(id);
    prevName.textContent = i > 0 ? label(ORDER[i - 1]) : T("rv.toMap");
    nextName.textContent = i < ORDER.length - 1 ? label(ORDER[i + 1]) : T("rv.toMap");
  }
  function urlFor(id) { var url = new URL(location.href); url.hash = id ? "#" + id : ""; return url; }

  function show(id) {
    render(id);
    dialog.classList.add("is-entering");      /* transparent until the curtain covers the model */
    if (!dialog.open) dialog.showModal();
    tint();
    title.focus({ preventScroll: true });   /* focus the room name, not Close: no ring after a tap, and screen readers hear where they are */
  }
  function open(id, push) {
    if (dialog.open || phase) return;
    var my = ++gen;
    phase = "entering";
    entries++;
    sheetAway();
    if (!learned) { learned = true; hintMode = "off"; store("dr-learned", 1); placeHint(); }
    if (push) history.pushState({ room: id }, "", urlFor(id));
    select(id);
    byId[id].el.classList.add("is-hot");
    walkTo(id);
    flyTo(id).then(function () {
      live(my);
      show(id);
      return curtainIn(id, dur(650, 380));
    }).then(function () {
      live(my);
      dialog.classList.remove("is-entering");
      byId[id].el.classList.remove("is-hot");
      return wait(calm.matches ? 0 : dur(420, 160));
    }).then(function () {
      live(my);
      revealRoom();
      return curtainOut(dur(750, 420));
    }).then(function () { live(my); phase = null; }).catch(quiet);
  }
  function closeNow() {
    var id = current;
    var my = ++gen;                       /* stops any entry or room change still running */
    if (id) byId[id].el.classList.remove("is-hot");
    var finish = function () {
      if (dialog.open) dialog.close();
      dialog.classList.remove("is-entering");
      dropCurtain();
      body.replaceChildren();
      current = null;
      phase = null;
      sheetBack();
      var f = id && byId[id].el.querySelector(".m-floor");
      if (f && root.dataset.view === "map") f.focus({ preventScroll: true });
    };
    if (!dialog.open) {                   /* Back or Close during the camera flight: just turn around */
      if (selected) byId[selected].el.classList.remove("is-hot");
      flyBack();
      phase = null;
      sheetBack();
      return;
    }
    dropCurtain();
    if (calm.matches || !id) { finish(); flyBack(); return; }
    phase = "closing";
    /* Mirror of entering: curtain over the room, then lift it off the model as the camera pulls back. */
    curtainIn(id, 300).then(function () {
      live(my);
      dialog.classList.add("is-entering");
      flyBack();
      return curtainOut(380);
    }).then(function () { live(my); finish(); }).catch(quiet);
  }
  function close() {
    if (phase === "closing") return;
    if (history.state && history.state.room) history.back();
    else { history.replaceState(null, "", urlFor("")); closeNow(); }
  }
  function step(dir) {
    if (!dialog.open || phase === "closing") return;
    var i = ORDER.indexOf(current) + dir;
    if (i < 0 || i >= ORDER.length) { close(); return; }
    var id = ORDER[i];
    var my = ++gen;                       /* a second tap on Next overtakes the first */
    dropCurtain();
    phase = "stepping";
    history.replaceState({ room: id }, "", urlFor(id));
    here = id;
    placeHere();
    select(id);
    curtainIn(id, 340).then(function () {
      live(my);
      render(id);
      return wait(calm.matches ? 0 : 120);
    }).then(function () {
      live(my);
      revealRoom();
      return curtainOut(400);
    }).then(function () { live(my); phase = null; }).catch(quiet);
  }

  /* ---------- Selection and the wall-label card ---------- */
  var card = document.querySelector("[data-card]");
  var cardPrints = card.querySelector("[data-card-prints]");
  var selected = null;
  function select(id) {
    if (selected === id) return;
    if (selected) { byId[selected].el.classList.remove("is-selected"); if (byId[selected].noEl) byId[selected].noEl.classList.remove("is-selected"); }
    selected = id;
    var m = byId[id];
    m.el.classList.add("is-selected");
    if (m.noEl) m.noEl.classList.add("is-selected");
    var names = (m.n || []).concat(m.e || []);
    if (id === "film") names = ["film", "ooc-1", "ooc-4"];
    cardPrints.classList.remove("is-swapping");
    cardPrints.replaceChildren.apply(cardPrints, names.slice(0, 3).map(function (n) {
      var img = new Image(); img.src = "assets/photos/" + n + "-360.webp"; img.alt = ""; img.width = 360; img.height = 450; img.decoding = "async";
      return img;
    }));
    void cardPrints.offsetWidth;
    cardPrints.classList.add("is-swapping");
    paintCard();
  }
  function paintCard() {
    var id = selected, m = byId[id];
    if (!m) return;
    card.querySelector("[data-card-wing]").textContent = m.side === "left" ? T("wing1.label") : m.side === "right" ? T("wing2.label") : T("cinema.label");
    card.querySelector("[data-card-no]").textContent = m.no ? T("room") + " " + m.no : T("epilogue");
    card.querySelector("[data-card-name]").textContent = m.id === "film" ? "In Motion" : m.name;
    card.querySelector("[data-card-sub]").textContent = sub(id);
    card.querySelector("[data-enter-label]").textContent = enterLabel(id);
    card.querySelector("[data-card-desc]").textContent = T("desc." + id);
    placeHint();
  }

  /* ---------- The panel ----------
     Phones and tablets: one bottom panel holds the chosen room and the list of all rooms, like the place
     panel in Apple Maps. It follows the finger from where it was grabbed, settles on a critically damped
     spring that starts from its current position and the release velocity, and resists past the top.
     Desktop: the same panel sits still in the left column. */
  var sheet = document.querySelector("[data-sheet]");
  var grip = sheet.querySelector("[data-sheet-grip]");
  var scroller = sheet.querySelector("[data-sheet-scroll]");
  var allBtn = sheet.querySelector("[data-sheet-all]");
  var phone = window.matchMedia("(max-width: 1023px)");
  var userPicked = false;
  var state = "rest", parked = "rest";       /* parked: where to return after a room closes */
  var y = 0, vel = 0, springRaf = 0, away = false;

  function sheetMax() { return Math.round(window.innerHeight * 0.88); }
  function visibleFor(s) {
    var g = grip.offsetHeight;
    if (s === "list") return sheetMax();
    if (s === "room") return Math.min(sheetMax(), g + card.offsetHeight + 12);
    return g;
  }
  function yFor(s) { return sheetMax() - visibleFor(s); }
  function apply() {
    sheet.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
  }
  /* Critically damped spring (Apple: damping 1.0, response about 0.35 s). */
  function springTo(target, v0, done) {
    cancelAnimationFrame(springRaf);
    if (calm.matches) { y = target; vel = 0; apply(); if (done) done(); return; }
    if (v0 !== undefined) vel = v0;
    var k = Math.pow(2 * Math.PI / 0.35, 2), c = 2 * Math.sqrt(k), last = performance.now();
    (function frame(now) {
      var dt = Math.min(0.032, (now - last) / 1000); last = now;
      var a = -k * (y - target) - c * vel;
      vel += a * dt; y += vel * dt;
      if (Math.abs(y - target) < 0.4 && Math.abs(vel) < 8) { y = target; vel = 0; apply(); if (done) done(); return; }
      apply();
      springRaf = requestAnimationFrame(frame);
    })(last);
  }
  function setState(s, v0) {
    state = s;
    sheet.dataset.state = s;
    allBtn.setAttribute("aria-expanded", String(s === "list"));
    if (s !== "list") scroller.scrollTop = 0;
    if (!phone.matches) return;
    mapview.style.setProperty("--sheet-space", visibleFor(s === "list" ? (userPicked ? "room" : "rest") : s) + "px");
    springTo(yFor(s), v0);
  }
  /* Out of the way while the camera flies in; back where it was when the room closes. */
  function sheetAway() {
    if (!phone.matches) return;
    parked = state; away = true;
    springTo(sheetMax() + 40, 0);
  }
  function sheetBack() {
    if (!phone.matches || !away) return;
    away = false;
    setState(parked === "list" ? "room" : parked);
  }

  /* Dragging */
  var drag = null;
  function onDown(e) {
    if (!phone.matches || e.button > 0 || away) return;
    /* In the list, only the grip drags; the rest scrolls. Buttons still get their taps. */
    if (state === "list" && !grip.contains(e.target) && scroller.scrollTop > 0) return;
    cancelAnimationFrame(springRaf);             /* catch the panel mid-flight */
    drag = { id: e.pointerId, startY: e.clientY, startPos: y, hist: [[e.timeStamp, e.clientY]], live: false, target: e.target };
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dy = e.clientY - drag.startY;
    if (!drag.live) {
      if (Math.abs(dy) < 8) return;              /* small hysteresis so taps stay taps */
      drag.live = true;
      sheet.setPointerCapture(e.pointerId);
      sheet.classList.add("is-dragging");
    }
    var top = 0, raw = drag.startPos + dy;
    /* Past the top it resists, like reaching the end of a scroll. */
    y = raw < top ? top - rubber(top - raw, window.innerHeight) : raw;
    drag.hist.push([e.timeStamp, e.clientY]);
    if (drag.hist.length > 6) drag.hist.shift();
    apply();
    e.preventDefault();
  }
  function rubber(over, dim) { var c = 0.55; return (over * dim * c) / (dim + c * over); }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    sheet.classList.remove("is-dragging");
    if (!d.live) return;                          /* it was a tap */
    var h = d.hist, a = h[0], b = h[h.length - 1];
    var v = (b[1] - a[1]) / Math.max(1, b[0] - a[0]) * 1000;   /* px/s, positive = down */
    /* Apple's momentum projection: where the panel would come to rest if released freely. */
    var projected = y + (v / 1000) * 0.998 / (1 - 0.998);
    var up = v < -400, down = v > 400;
    var swallow = function (ev) { ev.stopPropagation(); ev.preventDefault(); sheet.removeEventListener("click", swallow, true); };
    sheet.addEventListener("click", swallow, true);
    setTimeout(function () { sheet.removeEventListener("click", swallow, true); }, 0);
    if (state === "room") {
      if (up || projected < yFor("room") - window.innerHeight * 0.2) { springTo(yFor("room"), v); open(selected, true); return; }
      if (down || projected > yFor("room") + 60) { dismiss(v); return; }
      return setState("room", v);
    }
    if (state === "rest") {
      return setState(up || projected < yFor("rest") - 80 ? "list" : "rest", v);
    }
    /* list */
    if (down || projected > yFor("list") + window.innerHeight * 0.18) return setState(userPicked ? "room" : "rest", v);
    setState("list", v);
  }
  function dismiss(v) {
    userPicked = false;
    if (selected) { byId[selected].el.classList.remove("is-selected"); if (byId[selected].noEl) byId[selected].noEl.classList.remove("is-selected"); }
    sheet.classList.remove("has-room");
    setState("rest", v);
    setHint("off");
  }
  sheet.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  /* Tapping the grip toggles between the room (or the start) and the list. */
  grip.addEventListener("click", function (e) {
    if (e.target.closest("[data-sheet-all]")) return;
    if (!phone.matches) return;
    setState(state === "list" ? (userPicked ? "room" : "rest") : userPicked && state === "rest" ? "room" : "list");
  });
  allBtn.addEventListener("click", function () {
    if (!phone.matches) { sheet.querySelector(".roomlist").scrollIntoView({ behavior: calm.matches ? "auto" : "smooth", block: "start" }); return; }
    setState(state === "list" ? (userPicked ? "room" : "rest") : "list");
  });
  function userPick(id) {
    select(id);
    userPicked = true;
    sheet.classList.add("has-room");
    setHint("again");
    requestAnimationFrame(function () { setState("room"); reveal(id); });
  }
  /* Like Maps: keep the chosen room in view, centred in the space above the panel. */
  function reveal(id) {
    if (!phone.matches) return;
    var r = byId[id].el.querySelector(".m-floor").getBoundingClientRect();
    var barH = 56, free = window.innerHeight - visibleFor("room");
    var want = barH + (free - barH) / 2;
    var delta = (r.top + r.height / 2) - want;
    if (Math.abs(delta) < 24) return;
    window.scrollBy({ top: delta, behavior: calm.matches ? "auto" : "smooth" });
  }
  function layoutSheet() {
    if (!phone.matches) { cancelAnimationFrame(springRaf); sheet.style.transform = ""; mapview.style.removeProperty("--sheet-space"); return; }
    sheet.style.setProperty("--sheet-h", sheetMax() + "px");
    y = yFor(state); apply();
    setState(state);
  }
  phone.addEventListener("change", layoutSheet);

  card.querySelectorAll("[data-card-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      var i = (ORDER.indexOf(selected) + +b.dataset.cardStep + ORDER.length) % ORDER.length;
      userPick(ORDER[i]);
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
  var pressed = null;
  maq.addEventListener("pointerdown", function (e) {
    var t = e.target.closest("[data-room]");
    var id = t ? t.dataset.room : roomAt(e.clientX, e.clientY);
    if (!id) return;
    pressed = byId[id].el;
    pressed.classList.add("is-pressed");
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) {
    maq.addEventListener(t, function () { if (pressed) { var p = pressed; pressed = null; setTimeout(function () { p.classList.remove("is-pressed"); }, 90); } });
  });
  maq.addEventListener("click", function (e) {
    var t = e.target.closest("[data-room]");
    var id = t ? t.dataset.room : roomAt(e.clientX, e.clientY);
    if (!id) return;
    if (selected === id && userPicked) open(selected, true); else userPick(id);   /* the preset room still needs its own first tap */
  });
  document.querySelector(".roomlist").addEventListener("click", function (e) {
    var t = e.target.closest("[data-room]");
    if (t) { select(t.dataset.room); open(t.dataset.room, true); }
  });
  if (window.matchMedia("(hover: hover)").matches) {
    scene.addEventListener("pointerover", function (e) {
      if (e.pointerType !== "mouse") return;   /* a touch must never count as the first of two taps */
      var t = e.target.closest("[data-room]");
      if (t) userPick(t.dataset.room);
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
      if (dialog.open) { if (id !== current) render(id); } else open(id, false);
    } else if (dialog.open || phase === "entering") {
      closeNow();
    }
  });

  /* ---------- Language changes ---------- */
  if (window.I18N) I18N.onChange(function () {
    MODEL.forEach(function (m) {
      m.el.querySelector(".m-floor").setAttribute("aria-label", m.id === "film" ? T("aria.film") : T("aria.floor", { no: m.no, name: m.name }));
    });
    paintNames();
    paintVisits();
    paintCard();
    if (dialog.open && current && !phase) render(current);
  });

  /* ---------- Start ---------- */
  paintVisits();
  select(here && byId[here] ? here : "bugis");
  fit();
  if (document.fonts) document.fonts.ready.then(pinTags);
  var resizeTimer;
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { fit(); if (!away) layoutSheet(); }, 120); });
  layoutSheet();

  /* Hooks for the landing (intro.js). */
  window.DRMap = {
    scene: scene,
    unit: function () { return u; },
    refit: fit,
    arrive: function () {
      fit();
      if (calm.matches || !maq.animate) return;
      maq.animate([{ opacity: 0, transform: "translateY(30px) scale(.95)" }, { opacity: 1, transform: "none" }], { duration: 1100, easing: "cubic-bezier(.22,1,.36,1)" });
    }
  };

  /* Deep link (#jawa): open it, with the map underneath for Back. */
  var start = location.hash.slice(1);
  if (root.dataset.view === "map" && ORDER.indexOf(start) !== -1) {
    history.replaceState(null, "", urlFor(""));
    history.pushState({ room: start }, "", urlFor(start));
    here = start;
    placeHere();
    select(start);
    var my = ++gen;
    phase = "entering";
    entries++;
    sheetAway();
    show(start);
    curtain.classList.add("is-on");
    curtainIn(start, 10).then(function () {
      live(my);
      dialog.classList.remove("is-entering");
      return wait(calm.matches ? 0 : 500);
    }).then(function () { live(my); revealRoom(); return curtainOut(500); })
      .then(function () { live(my); phase = null; }).catch(quiet);
  }
})();
