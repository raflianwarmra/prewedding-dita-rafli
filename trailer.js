/* Entrance trailer: tap the poster in the welcome step and it grows into a full-page player.
   Plays inline (playsinline), with sound, and only after a tap: nothing but the poster loads before that. */
(function () {
  "use strict";
  var trailer = document.querySelector("[data-trailer]");
  var player = document.querySelector("[data-player]");
  if (!trailer || !player) return;

  var root = document.documentElement;
  var intro = document.querySelector("[data-intro]");
  var poster = trailer.querySelector("[data-trailer-poster]");
  var playBtn = trailer.querySelector("[data-trailer-play]");
  var backdrop = player.querySelector("[data-player-backdrop]");
  var frame = player.querySelector("[data-player-frame]");
  var video = player.querySelector("[data-player-video]");
  var still = player.querySelector("[data-player-still]");
  var closeBtn = player.querySelector("[data-player-close]");
  var toggleBtn = player.querySelector("[data-player-toggle]");
  var soundBtn = player.querySelector("[data-player-sound]");
  var bar = player.querySelector("[data-player-progress]");
  var wait = player.querySelector("[data-player-wait]");
  var errorBox = player.querySelector("[data-player-error]");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SHAPES = { portrait: { file: "trailer-9x16", ratio: 9 / 16 }, landscape: { file: "trailer-16x9", ratio: 16 / 9 } };
  var EASE = "cubic-bezier(.25,1,.5,1)";   /* ease-out-quart */
  var shape = null, open = false, closing = false, played = false, flight = null;
  var idleTimer = 0, waitTimer = 0, failTimer = 0, raf = 0;

  function T(k) { return window.I18N ? I18N.t(k) : k; }
  function icon(id) { return '<svg aria-hidden="true" viewBox="0 0 12 12"><use href="#' + id + '"/></svg>'; }

  /* ---------- Which cut fits this screen ---------- */
  function pickShape() {
    var next = window.innerHeight > window.innerWidth ? "portrait" : "landscape";
    if (next === shape) return;
    shape = next;
    trailer.classList.toggle("trailer--landscape", shape === "landscape");
    poster.src = "assets/video/" + SHAPES[shape].file + ".webp";
    poster.width = shape === "portrait" ? 720 : 1280;
    poster.height = shape === "portrait" ? 1280 : 720;
  }

  /* ---------- Labels (both languages) ---------- */
  function paintLabels() {
    playBtn.querySelector("[data-trailer-word]").textContent = T(played ? "trailer.replay" : "trailer.play");
    playBtn.querySelector(".trailer__icon").innerHTML = played ? icon("replay") : icon("play");
    playBtn.setAttribute("aria-label", T(played ? "trailer.replay.label" : "trailer.label"));
    closeBtn.querySelector("span").textContent = T("trailer.close");
    player.setAttribute("aria-label", T("trailer.name"));
    errorBox.textContent = T("trailer.error");
    paintToggle(); paintSound();
  }
  function paintToggle() {
    var paused = video.paused && !video.ended;
    toggleBtn.innerHTML = paused ? icon("play") : icon("pause");
    toggleBtn.setAttribute("aria-label", T(paused ? "trailer.resume" : "trailer.pause"));
  }
  function paintSound() {
    soundBtn.innerHTML = video.muted ? icon("sound-off") : icon("sound-on");
    soundBtn.setAttribute("aria-label", T(video.muted ? "trailer.unmute" : "trailer.mute"));
  }

  /* ---------- Geometry: the frame is the video's own rectangle, centred in the page ---------- */
  function target() {
    var r = SHAPES[shape].ratio, vw = window.innerWidth, vh = window.innerHeight;
    var w = Math.min(vw, vh * r), h = w / r;
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }
  function place(f) {
    frame.style.left = f.left + "px"; frame.style.top = f.top + "px";
    frame.style.width = f.width + "px"; frame.style.height = f.height + "px";
  }
  /* The poster's rectangle expressed as a transform of the full-size frame, plus its arched corners. */
  function fromPoster(f) {
    var p = trailer.getBoundingClientRect(), s = p.width / f.width;
    var top = shape === "portrait" ? f.width / 2 : 6 / s, bottom = 6 / s;
    return {
      transform: "translate(" + (p.left - f.left) + "px," + (p.top - f.top) + "px) scale(" + s + ")",
      clipPath: "inset(0 round " + top + "px " + top + "px " + bottom + "px " + bottom + "px)"
    };
  }
  var FULL = { transform: "translate(0,0) scale(1)", clipPath: "inset(0 round 0px 0px 0px 0px)" };

  /* ---------- Controls fade while playing ---------- */
  function wake() {
    player.classList.remove("is-idle");
    clearTimeout(idleTimer);
    if (open && !video.paused) idleTimer = setTimeout(function () { player.classList.add("is-idle"); }, 2000);
  }
  function tick() {
    if (video.duration) bar.style.transform = "scaleX(" + Math.min(1, video.currentTime / video.duration) + ")";
    raf = requestAnimationFrame(tick);
  }
  function showWait(on) {
    clearTimeout(waitTimer);
    if (!on) { wait.hidden = true; return; }
    waitTimer = setTimeout(function () { wait.hidden = false; }, 300);
  }
  function fail() {
    clearTimeout(failTimer); showWait(false);
    video.pause();
    errorBox.hidden = false;
    player.classList.remove("is-idle");
  }

  /* ---------- Open ---------- */
  function start() {
    if (open) return;
    open = true; closing = false;
    var src = "assets/video/" + SHAPES[shape].file + ".mp4";
    if (video.getAttribute("src") !== src) { video.setAttribute("src", src); still.src = poster.src; }
    else if (video.currentTime > 0) video.currentTime = 0;
    video.muted = false;
    errorBox.hidden = true;
    player.classList.remove("is-playing", "is-idle");
    bar.style.transform = "scaleX(0)";

    /* play() must run inside the tap for iOS to allow sound. */
    var p = video.play();
    if (p && p.catch) p.catch(function (e) {
      if (e && e.name === "NotAllowedError") { video.muted = true; paintSound(); video.play().catch(fail); }
      else if (!(e && e.name === "AbortError")) fail();
    });
    showWait(true);
    failTimer = setTimeout(function () { if (!player.classList.contains("is-playing")) fail(); }, 15000);

    player.hidden = false;
    var f = target();
    place(f);
    history.pushState({ trailer: 1 }, "", location.href);
    if (intro) intro.inert = true;
    trailer.classList.add("is-lifted");
    player.classList.add("is-opening");
    if (calm.matches) {
      player.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
      player.classList.remove("is-opening");
    } else {
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: EASE });
      flight = frame.animate([fromPoster(f), FULL], { duration: 650, easing: EASE });
      flight.onfinish = function () { flight = null; player.classList.remove("is-opening"); };
    }
    closeBtn.focus({ preventScroll: true });
    raf = requestAnimationFrame(tick);
    paintToggle(); paintSound();
  }

  /* ---------- Close (end, Tutup, Esc, Back) ---------- */
  function stop(fromHistory) {
    if (!open || closing) return;
    closing = true;
    if (!fromHistory && history.state && history.state.trailer) history.back();
    video.pause();
    clearTimeout(idleTimer); clearTimeout(failTimer); showWait(false);
    cancelAnimationFrame(raf);
    played = true;
    player.classList.remove("is-idle");
    player.classList.add("is-closing");
    var done = function () {
      player.hidden = true;
      player.classList.remove("is-closing", "is-playing");
      trailer.classList.remove("is-lifted");
      frame.getAnimations().forEach(function (a) { a.cancel(); });
      open = false; closing = false;
      if (intro) intro.inert = false;
      paintLabels();
      var begin = intro && intro.querySelector("[data-intro-next]");
      if (begin) begin.focus({ preventScroll: true });
    };
    if (flight) { flight.cancel(); flight = null; }
    if (calm.matches) { player.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).onfinish = done; return; }
    var f = target();
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 550, easing: EASE, fill: "forwards" });
    frame.animate([FULL, fromPoster(f)], { duration: 550, easing: EASE, fill: "forwards" }).onfinish = function () {
      backdrop.getAnimations().forEach(function (a) { a.cancel(); });
      done();
    };
  }

  /* ---------- Wiring ---------- */
  playBtn.addEventListener("click", start);
  poster.addEventListener("click", start);
  closeBtn.addEventListener("click", function () { stop(false); });
  toggleBtn.addEventListener("click", function () { if (video.paused) video.play().catch(fail); else video.pause(); });
  soundBtn.addEventListener("click", function () { video.muted = !video.muted; paintSound(); wake(); });
  frame.addEventListener("click", function () {
    if (closing || !errorBox.hidden) return;
    if (video.paused) video.play().catch(fail); else video.pause();
    wake();
  });
  player.addEventListener("pointermove", wake);
  player.addEventListener("pointerdown", wake);

  video.addEventListener("playing", function () {
    clearTimeout(failTimer); showWait(false);
    player.classList.add("is-playing");
    paintToggle(); wake();
  });
  video.addEventListener("waiting", function () { if (open) showWait(true); });
  video.addEventListener("pause", function () { paintToggle(); wake(); });
  video.addEventListener("ended", function () { stop(false); });
  video.addEventListener("error", function () { if (open) fail(); });

  player.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); stop(false); return; }
    if (e.key === " " && e.target.tagName !== "BUTTON") { e.preventDefault(); toggleBtn.click(); return; }
    if (e.key === "Tab") {   /* keep focus inside the player */
      var items = [closeBtn, toggleBtn, soundBtn], i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? items.length - 1 : 1)) % items.length].focus();
    }
    wake();
  });
  window.addEventListener("popstate", function () { if (open) stop(true); });
  window.addEventListener("resize", function () {
    if (open && !closing) { if (flight) { flight.cancel(); flight = null; player.classList.remove("is-opening"); } place(target()); }
    else if (!open) pickShape();
  });
  if (window.I18N) I18N.onChange(paintLabels);

  pickShape();
  paintLabels();
})();
