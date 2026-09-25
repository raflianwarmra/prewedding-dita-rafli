/* Living photos: each room's lead photo carries a short silent loop cut from the photographer's film.
   It loads only near the screen, plays only while on screen, and never for reduced motion or Data Saver
   (those visitors keep the still photo). Works for the scroll view and for the cloned room pages. */
(function () {
  "use strict";
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  if (saveData || !("IntersectionObserver" in window)) return;

  var ours = new WeakSet();          /* videos this script created (copies made by cloning are replaced) */
  var onScreen = new Set();

  /* Give the video its source (and matching still) once; both observers may ask first. */
  function load(v) { if (!v.getAttribute("src")) { v.poster = v.dataset.poster; v.src = v.dataset.src; v.load(); } }
  function play(v) { load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  /* Load when the photo comes within one screen of the viewport. */
  var loader = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var v = e.target.querySelector("video.living");
      if (v) load(v);
      loader.unobserve(e.target);
    });
  }, { rootMargin: "100% 0px" });

  /* Play while at least a third of it is visible; pause otherwise. */
  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target.querySelector("video.living");
      if (!v) return;
      if (e.intersectionRatio >= 0.34) { onScreen.add(v); if (!document.hidden) play(v); }
      else { onScreen.delete(v); v.pause(); }
    });
  }, { threshold: [0, 0.34, 0.6] });

  /* Sit exactly over the photo (not over a caption), with the photo's own corners. */
  function place(v, img) {
    v.style.left = img.offsetLeft + "px"; v.style.top = img.offsetTop + "px";
    v.style.width = img.offsetWidth + "px"; v.style.height = img.offsetHeight + "px";
    v.style.borderRadius = getComputedStyle(img).borderRadius;
  }
  var sizer = "ResizeObserver" in window ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) { var v = e.target.parentElement.querySelector("video.living"); if (v) place(v, e.target); });
  }) : null;

  function attach(fig) {
    var old = fig.querySelector("video.living");
    if (old && ours.has(old)) return;
    if (old) old.remove();                                   /* a copy from cloning: rebuild it */
    var img = fig.querySelector("img");
    if (!img) return;
    var id = fig.dataset.living;
    var v = document.createElement("video");
    v.className = "living";
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.setAttribute("disablepictureinpicture", ""); v.setAttribute("disableremoteplayback", "");
    v.preload = "none";
    v.dataset.poster = "assets/video/rooms/" + id + ".webp";   /* set with the source, not before */
    v.dataset.src = "assets/video/rooms/" + id + ".mp4";
    v.addEventListener("error", function () { onScreen.delete(v); v.remove(); });   /* the still stays */
    img.parentElement.appendChild(v);
    ours.add(v);
    place(v, img);
    if (sizer) sizer.observe(img);
    img.addEventListener("load", function () { place(v, img); });
    loader.observe(fig);
    watcher.observe(fig);
  }
  function detachAll() {
    document.querySelectorAll("video.living").forEach(function (v) { v.pause(); v.remove(); });
    onScreen.clear();
  }
  function scan(root) {
    if (calm.matches) return;
    (root.matches && root.matches("[data-living]") ? [root] : []).concat([].slice.call(root.querySelectorAll ? root.querySelectorAll("[data-living]") : []))
      .forEach(attach);
  }

  /* Room pages are cloned into the dialog: pick up new figures as they arrive. */
  new MutationObserver(function (records) {
    records.forEach(function (r) { r.addedNodes.forEach(function (n) { if (n.nodeType === 1) scan(n); }); });
  }).observe(document.body, { childList: true, subtree: true });

  document.addEventListener("visibilitychange", function () {
    onScreen.forEach(function (v) { if (document.hidden) v.pause(); else play(v); });
  });
  calm.addEventListener("change", function () { if (calm.matches) detachAll(); else scan(document); });

  scan(document);
})();
