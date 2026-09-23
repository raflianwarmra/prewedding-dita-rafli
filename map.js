/* Floor map view: plan, room pages, history, and the small delights. */
(function () {
  "use strict";
  var root = document.documentElement;
  var ORDER = ["bugis", "jawa", "palembang", "woven", "projection", "peranakan", "bappenas", "out-of-character", "film"];
  var ROOMS = 8; /* the cinema is the epilogue, not counted as a room */

  var plan = document.querySelector("[data-plan]");
  var dialog = document.querySelector("[data-roomview]");
  var body = dialog.querySelector("[data-body]");
  var title = dialog.querySelector("#roomview-title");
  var prevName = dialog.querySelector("[data-prev-name]");
  var nextName = dialog.querySelector("[data-next-name]");
  var progress = document.querySelector("[data-progress]");
  var you = plan.querySelector("[data-you]");
  var current = null;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  function button(id) { return plan.querySelector('[data-room="' + id + '"]'); }
  function label(id) {
    var b = button(id);
    return b.dataset.no ? b.dataset.no + " · " + b.dataset.name : b.dataset.name;
  }
  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }
  function canTransition() { return !!document.startViewTransition && !calm.matches; }

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
  }
  viewButtons.forEach(function (b) {
    b.addEventListener("click", function () { if (root.dataset.view !== b.dataset.viewSet) setView(b.dataset.viewSet); });
  });
  setView(root.dataset.view, true);

  /* ---------- Visits, stamps and the "you are here" dot ---------- */
  var visited = store("dr-visited") || [];
  function paintVisits() {
    ORDER.forEach(function (id) {
      var b = button(id);
      var seen = visited.indexOf(id) !== -1;
      b.classList.toggle("is-visited", seen);
      var base = b.getAttribute("aria-label").replace(/ \(visited\)$/, "");
      b.setAttribute("aria-label", seen ? base + " (visited)" : base);
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

  /* Points on the plan, relative to its box. */
  function doorPoint(id) {
    var p = plan.getBoundingClientRect();
    if (!id) return { x: p.width / 2, y: p.height - 10 };
    var r = button(id).getBoundingClientRect();
    if (id === "film") return { x: r.left - p.left + r.width / 2, y: r.bottom - p.top + 12 };
    var hall = plan.querySelector(".plan-hall").getBoundingClientRect();
    var x = button(id).dataset.side === "left" ? hall.left - p.left + 12 : hall.right - p.left - 12;
    return { x: x, y: r.top - p.top + r.height / 2 };
  }
  function place(pt) { you.style.transform = "translate(" + pt.x + "px," + pt.y + "px)"; }
  var here = store("dr-here");
  function placeHere() { place(doorPoint(here)); }

  /* Walk along the hall: to the centre line, along it, then to the door. */
  function walkTo(id) {
    var from = doorPoint(here), to = doorPoint(id);
    here = id;
    if (calm.matches || !you.animate) { place(to); return Promise.resolve(); }
    var hall = plan.querySelector(".plan-hall").getBoundingClientRect();
    var p = plan.getBoundingClientRect();
    var mid = hall.left - p.left + hall.width / 2;
    var t = function (pt) { return { transform: "translate(" + pt.x + "px," + pt.y + "px)" }; };
    var frames = [t(from), t({ x: mid, y: from.y }), t({ x: mid, y: to.y }), t(to)];
    var run = you.animate(frames, { duration: 560, easing: "cubic-bezier(.45,0,.2,1)" });
    place(to);
    return run.finished.catch(function () {});
  }

  /* ---------- Room page ---------- */
  function render(id) {
    var source = document.getElementById(id);
    var copy = source.cloneNode(true);
    copy.removeAttribute("id");
    copy.removeAttribute("aria-labelledby");
    copy.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
    copy.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
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

  function urlFor(id) {
    var url = new URL(location.href);
    url.hash = id ? "#" + id : "";
    return url;
  }

  function open(id, push) {
    var b = button(id);
    if (push) history.pushState({ room: id }, "", urlFor(id));
    var show = function () { render(id); dialog.showModal(); dialog.querySelector("[data-close]").focus({ preventScroll: true }); };
    walkTo(id).then(function () {
      if (!canTransition()) { dialog.classList.remove("is-vt"); show(); return; }
      dialog.classList.add("is-vt");
      b.style.viewTransitionName = "room";
      var vt = document.startViewTransition(function () {
        b.style.viewTransitionName = "";
        dialog.style.viewTransitionName = "room";
        show();
      });
      vt.finished.finally(function () { dialog.style.viewTransitionName = ""; });
    });
  }

  function closeNow() {
    var id = current;
    var finish = function () {
      dialog.close();
      body.replaceChildren();
      current = null;
      if (id) button(id).focus({ preventScroll: true });
    };
    if (!id || !canTransition() || !dialog.open) { finish(); return; }
    dialog.style.viewTransitionName = "room";
    var vt = document.startViewTransition(function () {
      dialog.style.viewTransitionName = "";
      button(id).style.viewTransitionName = "room";
      finish();
    });
    vt.finished.finally(function () { button(id).style.viewTransitionName = ""; });
  }

  /* Close through history when we added the entry, so Back and the button agree. */
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
    if (canTransition()) document.startViewTransition(function () { render(id); });
    else render(id);
  }

  plan.addEventListener("click", function (e) {
    var b = e.target.closest("[data-room]");
    if (b) open(b.dataset.room, true);
  });
  dialog.querySelector("[data-close]").addEventListener("click", close);
  dialog.querySelectorAll("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () { step(+b.dataset.step); });
  });
  dialog.addEventListener("cancel", function (e) { e.preventDefault(); close(); });

  window.addEventListener("popstate", function () {
    if (root.dataset.view !== "map") return;
    var id = location.hash.slice(1);
    if (ORDER.indexOf(id) !== -1) {
      if (dialog.open) render(id); else open(id, false);
    } else if (dialog.open) {
      closeNow();
    }
  });

  /* ---------- Start ---------- */
  paintVisits();
  requestAnimationFrame(placeHere);
  window.addEventListener("resize", placeHere);

  /* Deep link (#jawa): open it, with the map underneath for Back. */
  var start = location.hash.slice(1);
  if (root.dataset.view === "map" && ORDER.indexOf(start) !== -1) {
    history.replaceState(null, "", urlFor(""));
    history.pushState({ room: start }, "", urlFor(start));
    here = start;
    requestAnimationFrame(function () { placeHere(); render(start); dialog.showModal(); });
  }
})();
