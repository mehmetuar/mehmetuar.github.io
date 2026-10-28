/* Captain Match sitesi: dil, dünyalar + Usta kartları, Usta penceresi, Seyir Defteri, İndir, iletişim formu. Çerçevesiz JS. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  var lang = store.get("cm-lang") === "tr" ? "tr" : "en";
  function t(key) {
    var s = (CM.ui[lang] && CM.ui[lang][key]) || CM.ui.en[key] || key;
    for (var i = 1; i < arguments.length; i++) s = s.replace("{" + (i - 1) + "}", arguments[i]);
    return s;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- cihaz + mağaza linkleri ---------- */
  var ua = navigator.userAgent || "";
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // Play Console ▸ Edinim'de siteden gelen kurulumlar ayrı görünsün (/get sayfasındaki yöntem)
  var playUrl = CM.links.play + "&referrer=" + encodeURIComponent("utm_source=website&utm_medium=site&utm_campaign=home");
  $$('a[data-store="android"]').forEach(function (a) { a.href = playUrl; a.rel = "noopener"; });
  $$('a[data-store="ios"]').forEach(function (a) { a.rel = "noopener"; });
  var directDl = isIOS ? CM.links.appStore : isAndroid ? playUrl : null;
  if (directDl) { $("#navDl").href = directDl; $("#stickyBtn").href = directDl; }

  var pop = $("#dlPop"), navDl = $("#navDl");
  function setPop(open) { pop.hidden = !open; navDl.setAttribute("aria-expanded", open ? "true" : "false"); }
  navDl.addEventListener("click", function (e) {
    if (directDl) return;
    e.preventDefault(); setPop(pop.hidden);
  });
  document.addEventListener("click", function (e) { if (!pop.hidden && !e.target.closest(".dl-wrap")) setPop(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setPop(false); });

  /* ---------- menü ---------- */
  var drawer = $("#drawer"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", function () {
    var open = drawer.hidden; drawer.hidden = !open; menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$("#drawer a").forEach(function (a) { a.addEventListener("click", function () { drawer.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }); });

  /* ---------- dünyalar + Usta kartları ---------- */
  function poseSrc(k, i) { return "assets/img/crew/" + k + "-" + i + ".webp"; }
  function renderWorlds() {
    var html = "";
    CM.worlds.forEach(function (w, wi) {
      if (wi > 0) html += cloudBank(wi);
      var cards = "";
      CM.crew.forEach(function (c, ci) {
        if (c.w !== wi) return;
        cards += '<button class="crew-card" type="button" data-crew="' + ci + '" aria-label="' + esc(t("crew.open", c.name[lang])) + '">' +
          '<span class="bg"></span><img class="pose" src="' + poseSrc(c.k, 1) + '" alt="" loading="lazy" width="320" height="290">' +
          '<span class="frame"></span><span class="lv">L' + c.lv + '</span><span class="plate">' + esc(c.name[lang]) + "</span></button>";
      });
      var last = wi === CM.worlds.length - 1;
      if (last) cards += '<div class="crew-card soon" aria-label="' + esc(t("crew.soon")) + '"><span class="bg"></span><img class="pose" src="assets/img/crew/ortulu.webp" alt="" loading="lazy"><span class="frame"></span><span class="plate">' + esc(t("crew.soon")) + "</span></div>";
      var deco = w.id === "glacier" ? '<div class="snow" aria-hidden="true">' + flakes(26) + "</div>"
        : w.id === "moon" ? '<div class="sparkles" aria-hidden="true">' + glints(34) + '</div><div class="moon-disc" aria-hidden="true"></div>' : "";
      html += '<section class="world ' + w.cls + (wi % 2 ? " flip" : "") + '" id="w-' + w.id + '" aria-labelledby="wt-' + w.id + '">' + deco +
        '<div class="wrap" style="position:relative"><div class="world-body">' +
        '<figure class="phone reveal"><img src="assets/img/shots/' + w.shot + '.webp" alt="" loading="lazy" width="560" height="1211"></figure>' +
        '<div><div class="world-head reveal"><div class="ribbon"><h2 id="wt-' + w.id + '">' + esc(w.name[lang]) + "</h2></div>" +
        '<ul class="chapters">' + w.chapters[lang].map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
        '<p class="world-desc">' + esc(w.desc[lang]) + "</p></div>" +
        '<div class="reveal"><p class="crew-label">' + esc(w.label[lang]) + '</p><div class="crew-row' + (last ? " six" : "") + '">' + cards + "</div></div></div>" +
        "</div></div></section>";
    });
    $("#worlds").innerHTML = html;
    $$("#worlds .crew-card[data-crew]").forEach(function (b) {
      b.addEventListener("click", function () { openCrew(+b.dataset.crew); });
      b.addEventListener("pointerenter", function () { hop(b.querySelector(".pose"), CM.crew[+b.dataset.crew].k, false); });
    });
    observeReveal($("#worlds"));
  }
  function cloudBank(i) {
    var imgs = [["kabarcik_a", 8, 220], ["cekirdek", 26, 300], ["kabarcik_b", 48, 240], ["kabarcik_a", 70, 280], ["cekirdek", 92, 260]];
    return '<div class="cloud-bank' + (i === 2 ? " dusk" : "") + '" aria-hidden="true">' +
      imgs.map(function (c) { return '<img src="assets/img/clouds/' + c[0] + '.webp" alt="" style="left:' + c[1] + "%;--w:" + c[2] + 'px" loading="lazy">'; }).join("") + "</div>";
  }
  function rnd(a, b) { return (a + Math.random() * (b - a)).toFixed(2); }
  function flakes(n) { var s = ""; for (var i = 0; i < n; i++) s += '<i style="left:' + rnd(0, 100) + "%;--s:" + rnd(3, 8) + "px;--d:" + rnd(9, 18) + "s;--t:-" + rnd(0, 18) + "s;--x:" + rnd(-40, 40) + 'px"></i>'; return s; }
  function glints(n) { var s = ""; for (var i = 0; i < n; i++) s += '<i style="left:' + rnd(0, 100) + "%;top:" + rnd(30, 98) + "%;--s:" + rnd(2, 5) + "px;--d:" + rnd(2, 5) + "s;--t:-" + rnd(0, 5) + 's"></i>'; return s; }

  // Poz döngüsü: duruş → ara → tepe → zıplama → duruş (oyundaki "sakin, toplu" pozlar)
  function hop(img, k, loop) {
    if (reduce || !img || img._hop) return;
    var seq = [2, 3, 4, 3, 1], i = 0;
    img._hop = setInterval(function () {
      img.src = poseSrc(k, seq[i++]);
      if (i === seq.length) { clearInterval(img._hop); img._hop = null; if (loop) img._next = setTimeout(function () { hop(img, k, true); }, 2400); }
    }, 115);
  }
  function stopHop(img) { if (!img) return; clearInterval(img._hop); clearTimeout(img._next); img._hop = img._next = null; }

  /* ---------- Usta penceresi ---------- */
  var dlg = $("#crewDlg"), cur = 0;
  var openableCount = CM.crew.length;
  function fillCrew(i) {
    cur = (i + openableCount) % openableCount;
    var c = CM.crew[cur], w = CM.worlds[c.w], img = $("#crewImg");
    stopHop(img);
    $("#crewBox").classList.toggle("gold", w.id === "moon");
    $("#crewArt").className = "dlg-art " + (w.id === "glacier" ? "glacier" : w.id === "moon" ? "moon" : "");
    img.src = poseSrc(c.k, 1); img.alt = c.name[lang];
    for (var f = 2; f <= 4; f++) new Image().src = poseSrc(c.k, f);
    $("#crewKicker").textContent = t("crew.joins", w.label[lang], c.lv);
    $("#crewName").textContent = c.name[lang];
    $("#crewSig").textContent = "“" + c.line[lang] + "”";
    $("#crewStory").textContent = c.story[lang];
    $("#crewWake").textContent = c.wake[lang];
    $("#crewFare").textContent = c.fare[lang];
    $("#crewPrevName").textContent = CM.crew[(cur - 1 + openableCount) % openableCount].name[lang];
    $("#crewNextName").textContent = CM.crew[(cur + 1) % openableCount].name[lang];
    setTimeout(function () { hop(img, c.k, true); }, 500);
  }
  function openCrew(i) { fillCrew(i); if (!dlg.open) dlg.showModal(); }
  $("#crewPrev").addEventListener("click", function () { fillCrew(cur - 1); });
  $("#crewNext").addEventListener("click", function () { fillCrew(cur + 1); });
  dlg.addEventListener("close", function () { stopHop($("#crewImg")); });
  dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") fillCrew(cur - 1); if (e.key === "ArrowRight") fillCrew(cur + 1); });

  $$("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    $$("[data-close]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
  });

  /* ---------- Seyir Defteri ---------- */
  var page = 0;
  function para(list) { return list.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }
  function renderBook() {
    var e = CM.log[page], html;
    if (e.k === "legend") {
      html = '<div class="page"><div class="meta">' + esc(t("story.kicker")) + "</div><h3>" + esc(e.title[lang]) + "</h3>" + para(e.left[lang]) + "</div>" +
        '<div class="page cont">' + para(e.right[lang]) + '<p class="quote">' + esc(e.quote[lang]) + "</p></div>";
    } else if (e.open) {
      html = '<div class="page"><div class="meta">' + esc(e.at[lang]) + "</div><h3>" + esc(e.title[lang]) + "</h3>" + para(e.text[lang]) + "</div>" +
        '<div class="page"><figure class="pic"><img src="assets/img/story/' + e.k + '.webp" alt="" width="960" height="720"></figure></div>';
    } else {
      html = '<div class="page"><div class="meta">' + esc(e.at[lang]) + "</div><h3>" + esc(e.title[lang]) + '</h3><p style="opacity:.75">' + esc(t("book.locked.p")) + "</p></div>" +
        '<div class="page"><figure class="pic locked"><img src="assets/img/story/' + e.k + '.webp" alt="" width="960" height="720">' +
        '<figcaption class="lock-note"><img src="assets/img/icons/kilit.webp" alt="" width="64" height="64"><b>' + esc(t("book.locked")) + "</b></figcaption></figure></div>";
    }
    $("#spread").innerHTML = html;
    $("#pgCount").textContent = t("book.page", page + 1, CM.log.length);
    $("#pgPrev").disabled = page === 0;
    $("#pgNext").disabled = page === CM.log.length - 1;
    $$("#pgTabs button").forEach(function (b, i) { b.setAttribute("aria-current", i === page ? "true" : "false"); });
  }
  $("#pgTabs").innerHTML = CM.log.map(function (e, i) { return '<button type="button" class="' + (e.open ? "" : "locked") + '" data-p="' + i + '" aria-label="' + (i + 1) + '"></button>'; }).join("");
  $$("#pgTabs button").forEach(function (b) { b.addEventListener("click", function () { page = +b.dataset.p; renderBook(); }); });
  $("#pgPrev").addEventListener("click", function () { if (page > 0) { page--; renderBook(); } });
  $("#pgNext").addEventListener("click", function () { if (page < CM.log.length - 1) { page++; renderBook(); } });

  /* ---------- iletişim: form FormSubmit üzerinden doğrudan gönderilir ---------- */
  var cdlg = $("#contactDlg"), cst = $("#cfStatus"), csend = $("#cfSend");
  function guessDevice() {
    var m;
    if ((m = ua.match(/iPhone OS (\d+)[._](\d+)/))) return "iPhone, iOS " + m[1] + "." + m[2];
    if ((m = ua.match(/iPad.*OS (\d+)[._](\d+)/))) return "iPad, iPadOS " + m[1] + "." + m[2];
    if ((m = ua.match(/Android (\d+(\.\d+)?)/))) return "Android " + m[1];
    return "";
  }
  function status(kind, text) {
    cst.hidden = !kind; cst.className = "form-status " + (kind || ""); cst.textContent = text || "";
    if (kind === "err") { var a = document.createElement("a"); a.href = "mailto:" + CM.links.email; a.textContent = CM.links.email; cst.appendChild(document.createTextNode(" ")); cst.appendChild(a); }
  }
  function sending(on) { csend.disabled = on; $("span", csend).textContent = t(on ? "cf.sending" : "cf.send"); }
  $$("[data-open-contact]").forEach(function (b) { b.addEventListener("click", function (e) {
    e.preventDefault(); var d = $("#cfDevice"); if (!d.value) d.value = guessDevice(); status(); cdlg.showModal(); setTimeout(function () { $("#cfEmail").focus(); }, 50);
  }); });
  $("#contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var form = this;
    if ($("#cfHoney").value) return; // spam botu gizli alanı doldurdu
    var topic = $("#cfTopic"), label = topic.options[topic.selectedIndex].text;
    var data = {
      email: $("#cfEmail").value.trim(), Topic: label, Device: $("#cfDevice").value.trim() || "-", Level: $("#cfLevel").value.trim() || "-",
      Message: $("#cfMsg").value.trim(), Language: lang.toUpperCase(),
      _subject: "[Captain Match] " + label, _template: "table", _captcha: "false"
    };
    sending(true); status();
    fetch(CM.links.form, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (String(j.success) !== "true") throw new Error(j.message || "form");
        form.reset(); $("#cfDevice").value = guessDevice(); status("ok", t("cf.ok"));
      })
      .catch(function () { status("err", t("cf.err")); })
      .then(function () { sending(false); });
  });
  $("#cfCopy").addEventListener("click", function () {
    var b = this, done = function () { b.textContent = t("cf.copied"); setTimeout(function () { b.textContent = t("cf.copy"); }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(CM.links.email).then(done, function () { prompt("", CM.links.email); });
    else prompt("", CM.links.email);
  });

  /* ---------- dil ---------- */
  function applyLang(l) {
    lang = l; store.set("cm-lang", l);
    document.documentElement.lang = l;
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    $$("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === l ? "true" : "false"); });
    renderWorlds(); renderBook();
    if (dlg.open) fillCrew(cur);
  }
  $$("[data-lang]").forEach(function (b) { b.addEventListener("click", function () { applyLang(b.dataset.lang); }); });

  /* ---------- görünüme girince + etkin bağlantı + alt çubuk ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function observeReveal(root) { $$(".reveal", root).forEach(function (el) { if (io && !reduce) io.observe(el); else el.classList.add("in"); }); }

  var sticky = $("#stickyDl"), heroOut = false, finalIn = false, dismissed = false;
  function updSticky() { var on = heroOut && !finalIn && !dismissed; sticky.classList.toggle("show", on); sticky.setAttribute("aria-hidden", on ? "false" : "true"); }
  $("#stickyX").addEventListener("click", function () { dismissed = true; updSticky(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; updSticky(); }, { threshold: 0.05 }).observe($(".hero"));
    new IntersectionObserver(function (es) { finalIn = es[0].isIntersecting; updSticky(); }).observe($("#download"));
    // bölüm → menü bağlantısı (dünyalar bandı "Worlds"u, destek bölümü "FAQ"yu yakar)
    var links = $$(".nav-links a"), sec = { game: "game", voyage: "voyage", worlds: "voyage", story: "story", support: "faq" };
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + sec[en.target.id]); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(sec).forEach(function (id) { var el = document.getElementById(id); if (el) navIO.observe(el); });
  }

  observeReveal(document);
  // inceleme bağlantıları: ?lang=tr · ?crew=9 (Usta penceresi) · ?page=7 (defter sayfası) · ?contact=1 · ?pop=1
  var qs = new URLSearchParams(location.search);
  if (qs.get("page")) page = Math.min(Math.max(+qs.get("page") - 1, 0), CM.log.length - 1);
  applyLang(qs.get("lang") === "tr" || qs.get("lang") === "en" ? qs.get("lang") : lang);
  if (qs.get("crew")) openCrew(+qs.get("crew") - 1);
  if (qs.get("contact")) $("[data-open-contact]").click();
  if (qs.get("pop") && !directDl) setPop(true);
})();
