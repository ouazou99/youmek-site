/* ============================================================
   YOUMEK WEBSITE SETTINGS: edit these, then upload again.
   ============================================================ */
window.YOUMEK = {
  // Paste the store links when the app is live. Empty = the button says "Coming soon".
  appStore: "",      // e.g. "https://apps.apple.com/app/id0000000000"
  googlePlay: "",    // e.g. "https://play.google.com/store/apps/details?id=com.youmek.app"
  webApp: "",        // e.g. "https://app.youmek.com" (empty hides the web link)
  // Formspree form link for the email signup (free at formspree.io), e.g. "https://formspree.io/f/abcdwxyz"
  formEndpoint: "https://formspree.io/f/xqpejwpk"
};

/* ============================================================
   Page behaviour (no need to edit below)
   ============================================================ */
(function () {
  var cfg = window.YOUMEK || {};
  var doc = document.documentElement;
  var lang = doc.lang === "ar" ? "ar" : "en";
  doc.classList.remove("no-js");

  // Store buttons: live link, or "Coming soon" until the app is published.
  document.querySelectorAll("[data-store]").forEach(function (a) {
    var url = cfg[a.getAttribute("data-store")];
    if (url) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      a.setAttribute("role", "link");
      var small = a.querySelector(".store-small");
      if (small && a.dataset.soon) small.textContent = a.dataset.soon;
    }
  });
  document.querySelectorAll("[data-webapp]").forEach(function (a) {
    if (cfg.webApp) a.href = cfg.webApp;
    else a.hidden = true;
  });

  // Remember the language the visitor picks.
  document.querySelectorAll("[data-setlang]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("youmek-lang", a.getAttribute("data-setlang")); } catch (e) {}
    });
  });

  // Email signup (Formspree).
  document.querySelectorAll("form[data-signup]").forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var msg = form.querySelector(".msg");
    var row = form.querySelector(".signup-row");
    var t = form.dataset;
    function show(text, isError) {
      msg.textContent = text;
      msg.classList.toggle("err", !!isError);
      msg.hidden = false;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.hidden = true;
      if (form.querySelector(".hp input").value) return; // a bot filled the hidden field
      var email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return show(t.bad, true);
      }
      input.removeAttribute("aria-invalid");
      if (!cfg.formEndpoint) return show(t.closed, true);
      button.disabled = true;
      var label = button.textContent;
      button.textContent = t.sending;
      fetch(cfg.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email, language: lang, source: "youmek.com" })
      })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          row.hidden = true;
          show(t.thanks, false);
        })
        .catch(function () { show(t.error, true); })
        .finally(function () { button.disabled = false; button.textContent = label; });
    });
  });

  // Sections fade in as you scroll (skipped when reduced motion is on).
  var items = document.querySelectorAll(".reveal");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || calm) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
