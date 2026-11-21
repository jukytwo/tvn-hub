/* Khung chung TVN Insight cho Thế giới, Vĩ mô, Hub khi mở riêng (anh Vũ yêu cầu làm ngay 25/10/2026, thư i-20261025-g7nk).
 * Đăng tại https://jukytwo.github.io/tvn-hub/tvn-khung.js (cùng miền với ba trang), nạp bằng:
 *   <script src="/tvn-hub/tvn-khung.js" data-app="hub|vimo|thegioi" data-ten="Tên trang" defer></script>
 * - Thanh đầu nền #16294A viền vàng mảnh: ‹ TVN Insight, tên trang, (máy tính) 5 mục của TVN Insight, 🗺 Sơ đồ, nút sáng tối,
 *   chỗ cho nút tài khoản (#tvnF-chip, tvn-auth.js đặt vào qua data-chip).
 * - Điện thoại (đến 760px): thanh 5 mục dưới đáy giống TVN Insight; menu riêng của trang chuyển lên ngay dưới thanh đầu.
 * - Sáng tối theo localStorage tvn_dash_theme (light, dark, còn lại là theo máy), đổi ở đây thì TVN Insight cũng đổi.
 * - Nhúng (?embed=1 hoặc nằm trong iframe): không vẽ khung, vỏ TVN Insight đã có đầu trang và menu.
 * - Có embed=1 (bản một khung /bantin/v2/): chế độ "chỉ nội dung", xem hàm noiDung().
 * Nguồn: radar/hub/tvn-khung.js trong kho tvn-hermes-bot; bản đăng là bản chép nguyên văn.
 */
(function () {
  "use strict";
  var S = document.currentScript || document.querySelector("script[src*='tvn-khung.js']");
  var APP = (S && S.dataset.app) || "", TEN = (S && S.dataset.ten) || document.title;
  var R = document.documentElement, q = new URLSearchParams(location.search);
  var nhung = q.get("embed") === "1";
  try { nhung = nhung || window.self !== window.top; } catch (e) { nhung = true; }
  if (!window.__tvnSua) { window.__tvnSua = 1; suaTrang(); }
  if (q.get("embed") === "1" && !window.__tvnNoiDung) { window.__tvnNoiDung = 1; noiDung(); }
  if (nhung || window.__tvnKhung) return;

  // ---------- chế độ "chỉ nội dung" cho bản TVN Insight một khung /bantin/v2/ (anh Vũ duyệt 27/10/2026, thư i-20261027-v2ln) ----------
  // Chỉ bật khi đường dẫn có embed=1 (bản v2 luôn truyền), để bản TVN Insight cũ không đổi gì.
  // 1. Nền trong suốt, theo theme=light|dark trên đường dẫn; Hub và Vĩ mô đã tự ẩn đầu trang, chân trang, nút quay lại, hỏi đáp riêng.
  // 2. Liên kết sang mục khác của TVN Insight đi qua window.parent.location.hash (#hoi/hamy, #hoi/baocao, #hoi/caotin?ma=XXX, #hoi/vimo).
  // 3. Báo chiều cao {tvn:"h", h} mỗi khi nội dung đổi cao. 4. Giữ nguyên mọi selector cũ.
  function noiDung() {
    var th = q.get("theme"), st = document.createElement("style");
    st.textContent = "html,body{background:transparent!important}" +
      (APP === "vimo" ? "html.vmx-embed .vm-foot,html.vmx-embed footer,html.vmx-embed #vmBackF{display:none!important}" : "");
    (document.head || R).appendChild(st);
    var thDang = "", henVm = 0;
    function datTheme(t) {
      if ((t !== "light" && t !== "dark") || t === thDang) return; thDang = t;
      R.setAttribute("data-tvnf", t);
      if (APP === "hub") R.setAttribute("data-theme", t);
      // Vĩ mô: VM.setTheme chỉ gắn lớp .vm-light, còn vài luật tối (ô Đọc nhanh .vm-quick, biến :root) chỉ xét data-mode / data-theme trên html,
      // nên máy đang tối mà khung ở bản sáng thì ô Đọc nhanh chữ vàng nhạt trên nền kem (rà 05/11/2026); gắn luôn hai thuộc tính đó
      else if (APP === "vimo") { R.setAttribute("data-mode", t); R.setAttribute("data-theme", t); var datVm = function () { var V = window.VM; if (V && typeof V.setTheme === "function") { V.setTheme(t); return true; } return false; };
        clearInterval(henVm); if (!datVm()) { var n = 0; henVm = setInterval(function () { if (datVm() || ++n > 40) clearInterval(henVm); }, 150); } }
    }
    datTheme(th);
    // Đổi sáng tối ngay trong TVN Insight (nút ◑ hoặc máy đổi giao diện) khi khung đang mở: theme= trên đường dẫn đã cũ,
    // nên đọc thẳng trang mẹ (cùng miền) và theo dõi data-theme của nó; trang mẹ khác miền thì nhận tin nhắn {tvn:"theme", theme} (rà 05/11/2026)
    try {
      var M = window.parent !== window && window.parent.document && window.parent.document.documentElement;
      if (M) {
        var mqM = window.parent.matchMedia ? window.parent.matchMedia("(prefers-color-scheme: dark)") : null;
        var theoMe = function () { var a = M.getAttribute("data-theme"); datTheme(a === "light" || a === "dark" ? a : (mqM && mqM.matches ? "dark" : "light")); };
        new MutationObserver(theoMe).observe(M, {attributes: true, attributeFilter: ["data-theme"]});
        if (mqM) { if (mqM.addEventListener) mqM.addEventListener("change", theoMe); else if (mqM.addListener) mqM.addListener(theoMe); }
        theoMe();
      }
    } catch (e) { /* trang mẹ khác miền */ }
    addEventListener("message", function (ev) { if (ev.source === window.parent && ev.data && ev.data.tvn === "theme") datTheme(ev.data.theme); });
    // đường dẫn trong trang mẹ cho một liên kết, null nếu là liên kết trong chính trang này
    var KHOI = (q.get("khoi") || "").split(",");
    function dich(u) {
      if (u.origin !== location.origin) return null;
      var p = u.pathname, s = u.searchParams;
      if (p === location.pathname && u.search === location.search) return null;
      if (/^\/vimo\/?$/.test(p) || /^\/vimo\/index\.html$/.test(p)) return "#hoi/vimo";
      if (/^\/tvn-hub\/?(index\.html)?$/.test(p)) {
        var k = s.get("khoi") || "", ma = s.get("ma");
        if (/(^|,)bc(,|$)/.test(k) || u.hash === "#bao-cao") return "#hoi/baocao";
        if (/(^|,)run(,|$)/.test(k) || u.hash === "#thuc-thi") return "#hoi/caotin" + (ma ? "?ma=" + encodeURIComponent(ma) : "");
        return "#hoi/hamy";
      }
      return null;
    }
    function di(h) { try { window.parent.location.hash = h; return true; } catch (e) { return false; } }
    window.tvnDi = di;
    document.addEventListener("click", function (ev) {
      var el = ev.target && ev.target.closest ? ev.target : null; if (!el) return;
      // Hub đang nhúng khối Hàm ý (không có Báo cáo): mở báo cáo thì chuyển sang mục Báo cáo của khung
      if (APP === "hub" && KHOI.indexOf("bc") < 0 && el.closest("[data-bc]")) { if (di("#hoi/baocao")) { ev.preventDefault(); ev.stopImmediatePropagation(); } return; }
      var a = el.closest("a[href]"); if (!a || a.target === "_blank" && !/jukytwo\.github\.io/.test(a.href)) return;
      var u; try { u = new URL(a.getAttribute("href"), location.href); } catch (e) { return; }
      var h = dich(u); if (h && di(h)) { ev.preventDefault(); ev.stopImmediatePropagation(); }
    }, true);
    var cu = 0, hen = 0;
    function cao() { var b = document.body; if (!b) return;
      var h = Math.ceil(b.getBoundingClientRect().bottom + (window.scrollY || 0)) + 2;   // chiều cao thật của nội dung, kể cả khi ngắn hơn khung
      if (h < 50) h = R.scrollHeight; if (Math.abs(h - cu) < 2) return; cu = h;
      try { window.parent.postMessage({tvn: "h", h: h}, "*"); } catch (e) { /* bỏ */ } }
    function doi() { cancelAnimationFrame(hen); hen = requestAnimationFrame(cao); }
    var bat = function () { if ("ResizeObserver" in window) { new ResizeObserver(doi).observe(R); if (document.body) new ResizeObserver(doi).observe(document.body); }
      if (document.body) new MutationObserver(doi).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open", "class"]});
      document.addEventListener("toggle", doi, true); doi(); bamKhung(); };
    if (document.body) bat(); else document.addEventListener("DOMContentLoaded", bat);
    addEventListener("load", function () { cu = 0; doi(); setTimeout(function () { cu = 0; doi(); }, 800); });
    // điện thoại: thanh mục 6 ô như bản mở thẳng, không dàn ngang khuất "Người dân, Clip, Thêm" (555px trong khung 347px).
    // Bộ chọn có nav và .app-bar6 để thắng #vmx-css của Vĩ mô (nạp sau, cùng độ ưu tiên với html.vmx-embed .app-bar button).
    if (APP === "vimo") st.textContent +=
      "@media (max-width:560px){html.vmx-embed nav.app-bar.app-bar6{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:0!important;padding:3px 4px!important;overflow:visible!important}" +
      "html.vmx-embed nav.app-bar.app-bar6 button{display:grid!important;justify-items:center;align-content:center;gap:2px!important;padding:3px 2px!important;min-width:0!important;min-height:44px!important;font-size:10.5px!important;line-height:1.15!important;white-space:normal!important;text-align:center!important;flex:none!important}" +
      "html.vmx-embed nav.app-bar.app-bar6 button span{white-space:normal!important;overflow-wrap:anywhere}" +
      "html.vmx-embed nav.app-bar.app-bar6 svg{display:block!important;width:19px!important;height:19px!important;flex:none!important}}";
  }

  // ---------- khung nhúng tự cao (TVN Insight /bantin/v2/): "fixed" và "sticky" bám phần khung đang thấy (rà 05/11/2026) ----------
  // Khung cao bằng cả trang (Vĩ mô ~11.600px) và không tự cuộn, nên phần tử fixed bám cả khung: bảng Thêm, hộp thoại, ngăn Thuật ngữ,
  // thông báo nhỏ mở ở đáy hay giữa khung, cách chỗ đang xem hàng nghìn px; thanh mục sticky không dính. Ở đây đo phần khung đang thấy
  // trong trang mẹ (dưới thanh đầu, trên thanh mục dưới), ghi --tvnV-t / --tvnV-b, dời mọi luật fixed theo đó, giả sticky bằng transform,
  // và lệnh cuộn về đầu trong khung thì cuộn trang mẹ. Trang mẹ khác miền thì bỏ qua.
  function bamKhung() {
    var P, F;
    try { P = window.parent; F = window.frameElement; if (!F || P === window || !P.document) return; } catch (e) { return; }
    var css = document.createElement("style"); css.id = "tvnV-css"; (document.head || R).appendChild(css);
    var dinh = [], hen2 = 0, hen3 = 0, mau = "";
    function gia(v) { return v && v !== "auto" && v !== "initial" ? v : ""; }
    function quet() {   // luật fixed có top/bottom -> luật đè cùng bộ chọn, cùng điều kiện @media, thêm khoảng lệch phần đang thấy
      var out = [];
      function di(rules, bao) {
        for (var i = 0; i < rules.length; i++) {
          var r = rules[i];
          if (r.selectorText && r.style && r.style.getPropertyValue("position") === "fixed" && r.parentStyleSheet && r.parentStyleSheet.ownerNode !== css) {
            var t = gia(r.style.getPropertyValue("top")), b = gia(r.style.getPropertyValue("bottom")), d = [];
            if (t) d.push("top:calc(var(--tvnV-t,0px) + (" + t + "))!important");
            if (b) d.push("bottom:calc(var(--tvnV-b,0px) + (" + b + "))!important");
            if (t && b) d.push("max-height:none!important");
            if (d.length) { var x = r.selectorText + "{" + d.join(";") + "}"; for (var k = bao.length - 1; k >= 0; k--) x = bao[k] + "{" + x + "}"; out.push(x); }
          } else if (r.cssRules && !r.selectorText) {
            var dk = r.media ? "@media " + r.media.mediaText : r.conditionText ? "@supports " + r.conditionText : "";
            if (dk) di(r.cssRules, bao.concat([dk]));
          }
        }
      }
      for (var s = 0; s < document.styleSheets.length; s++) { var sh = document.styleSheets[s]; if (sh.ownerNode === css) continue; try { di(sh.cssRules, []); } catch (e) { /* khác miền */ } }
      var moi = out.join("\n"); if (moi !== mau) { mau = moi; css.textContent = moi; }
      // phần tử sticky bám trên (không nằm trong vùng tự cuộn): giả sticky
      dinh = [];
      document.querySelectorAll("body *").forEach(function (el) {
        var cs = getComputedStyle(el); if (cs.position !== "sticky" || cs.top === "auto" || cs.display === "none") return;
        for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) { var o = getComputedStyle(p); if (/(auto|scroll|hidden)/.test(o.overflowY)) return; }
        el.__tvnTop = parseFloat(cs.top) || 0; dinh.push(el);
      });
      vung();
    }
    var ung = null;   // các phần tử fixed/sticky của trang mẹ, lập một lần, lập lại khi trang mẹ đổi cỡ
    function bien() {   // mép dưới thanh đầu và mép trên thanh mục dưới của trang mẹ
      var vh = P.innerHeight, vw = P.innerWidth, tr = 0, du = vh;
      if (!ung) { ung = []; var ds = P.document.querySelectorAll("body *");
        for (var j = 0; j < ds.length; j++) { var p = P.getComputedStyle(ds[j]).position; if ((p === "fixed" || p === "sticky") && ds[j] !== F && !ds[j].contains(F)) ung.push(ds[j]); } }
      for (var i = 0; i < ung.length; i++) {
        var e = ung[i], cs = P.getComputedStyle(e); if (!e.isConnected || (cs.position !== "fixed" && cs.position !== "sticky")) continue;
        var r = e.getBoundingClientRect(); if (!r.height || r.height > vh * 0.4 || r.width < vw * 0.5 || cs.visibility === "hidden" || +cs.opacity < 0.1) continue;
        if (r.top <= 2 && r.bottom > 0) tr = Math.max(tr, r.bottom);
        else if (r.bottom >= vh - 2 && r.top < vh) du = Math.min(du, r.top);
      }
      return [tr, du];
    }
    function vung() {
      try {
        var f = F.getBoundingClientRect(), h = f.height, bb = bien(), v1 = Math.min(h, Math.max(0, bb[0] - f.top)), v2 = Math.min(h, Math.max(v1, bb[1] - f.top));
        R.style.setProperty("--tvnV-t", Math.round(v1) + "px"); R.style.setProperty("--tvnV-b", Math.round(h - v2) + "px"); R.style.setProperty("--tvnV-h", Math.round(v2 - v1) + "px");
        // đọc hết rồi mới ghi (một lần tính bố cục cho cả chục tiêu đề bảng sticky); vị trí gốc = vị trí hiện tại trừ phần đã dời
        var moi = dinh.map(function (el) {
          var r = el.getBoundingClientRect(), da = el.__tvnD || 0, cha = el.parentElement.getBoundingClientRect();
          return Math.round(Math.max(0, Math.min(v1 + (el.__tvnTop || 0) - (r.top - da), cha.bottom - (r.bottom - da))));
        });
        dinh.forEach(function (el, i) { if (moi[i] !== (el.__tvnD || 0)) { el.__tvnD = moi[i]; el.style.transform = moi[i] ? "translateY(" + moi[i] + "px)" : ""; } });
      } catch (e) { /* khung đã bị gỡ */ }
    }
    function doiV() { cancelAnimationFrame(hen2); hen2 = requestAnimationFrame(vung); }
    function doiQ() { clearTimeout(hen3); hen3 = setTimeout(quet, 120); }
    function doiP() { ung = null; doiV(); }
    P.addEventListener("scroll", doiV, {passive: true}); P.addEventListener("resize", doiP);
    addEventListener("resize", doiQ);
    addEventListener("pagehide", function () { try { P.removeEventListener("scroll", doiV); P.removeEventListener("resize", doiP); } catch (e) { /* bỏ */ } });
    new MutationObserver(function (ms) {   // trang thêm <style>/<link> thì quét lại luật fixed
      for (var i = 0; i < ms.length; i++) { var n = ms[i].addedNodes; for (var j = 0; j < n.length; j++) { var t = n[j].tagName; if ((t === "STYLE" || t === "LINK") && n[j] !== css) { doiQ(); return; } } }
    }).observe(document.documentElement, {childList: true, subtree: true});
    // cuộn trong khung (đổi mục gọi scrollTo(0,0), nút lên đầu, nhảy tới mục) thì cuộn trang mẹ tới đúng chỗ;
    // về đầu khi đầu khung vẫn đang thấy thì để yên (không kéo trang mẹ lúc nạp)
    var goc = window.scrollTo.bind(window), daBam = false;   // chỉ theo lệnh cuộn sau khi người xem bấm trong khung, để lúc nạp trang mẹ không bị kéo
    addEventListener("pointerdown", function () { daBam = true; }, true); addEventListener("keydown", function () { daBam = true; }, true);
    window.scrollTo = window.scroll = function (a, b) {
      var y = a && typeof a === "object" ? a.top : b; if (!daBam || y == null || !isFinite(+y)) return goc.apply(window, arguments);
      try { var f = F.getBoundingClientRect(), bb = bien(); if (+y === 0 && f.top >= bb[0]) return;
        P.scrollTo({top: Math.max(0, P.scrollY + f.top - bb[0] + (+y)), behavior: "auto"}); } catch (e) { goc(0, +y); }
    };
    quet(); addEventListener("load", function () { doiQ(); setTimeout(doiQ, 1500); });
  }

  // ---------- sửa giao diện theo đánh giá UI/UX 27/10/2026 (thư i-20261027-ux4v, m-20261027-ux7k); chạy cả khi trang nằm trong khung nhúng ----------
  function suaTrang() {
    var c = [
      // vùng chạm của thanh đầu khung
      "#tvnF-dau .tvnF-ve{display:inline-flex;align-items:center;min-height:40px}#tvnF-dau .tvnF-tab a{min-height:36px}"
    ];
    // Báo cáo 2 cột của Hub và các sửa của Thế giới nay nằm thẳng trong mã từng trang (dọn mã 03/11/2026)
    var st = document.createElement("style"); st.id = "tvnS-css"; st.textContent = c.join("\n");
    (document.head || R).appendChild(st);
  }
  window.__tvnKhung = 1;
  R.classList.add("tvnF", "tvnF-" + APP);

  var GOC = "https://jukytwo.github.io/bantin/";
  // đúng tên, mã mục và biểu tượng thanh mục của TVN Insight /bantin/v2/ (NAV trong index.html); Insight đổi "Công cụ" thành "Hỏi & Phân tích" (#hoi)
  var MUC = [["homnay", "Hôm nay"], ["thitruong", "Thị trường"], ["bantin", "Bản tin"], ["hoi", "Hỏi & Phân tích"], ["khuyennghi", "Khuyến nghị"]];
  var DANG = {hub: "hoi", vimo: "hoi", thegioi: "thitruong"}[APP] || "";
  var IC = {   // cùng bộ biểu tượng menu dưới của TVN Insight
    homnay: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    thitruong: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    bantin: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    hoi: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    khuyennghi: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'
  };
  var svg = function (p) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + "</svg>"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); };

  // ---------- sáng tối ----------
  // TVN Insight /bantin/v2/ ghi sáng tối ở "tvn-theme"; khóa cũ "tvn_dash_theme" vẫn ghi kèm cho các trang còn đọc nó.
  // Đọc "tvn-theme" trước, nếu không thì đang tối ở Insight mà mở Thế giới, Hub, Vĩ mô lại ra nền sáng (rà 05/11/2026).
  var KEY = "tvn_dash_theme", KEY_IN = "tvn-theme", mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null, tu = false;
  function chon() { try { var t = localStorage.getItem(KEY_IN); if (t !== "light" && t !== "dark") t = localStorage.getItem(KEY); return t === "light" || t === "dark" ? t : "auto"; } catch (e) { return "auto"; } }
  function thuc(t) { return t === "auto" ? (mq && mq.matches ? "dark" : "light") : t; }
  function ghi(t) { try { if (t === "auto") { localStorage.removeItem(KEY); localStorage.removeItem(KEY_IN); } else { localStorage.setItem(KEY, t); localStorage.setItem(KEY_IN, t); } } catch (e) { /* bỏ */ } }
  function moc() {   // Vĩ mô: mọi lần đổi giao diện trong trang (bảng Thêm, Cài đặt) ghi luôn vào tvn_dash_theme
    var V = window.VM;
    if (APP !== "vimo" || !V || typeof V.setTheme !== "function" || V.__tvnF) return V && V.__tvnF;
    var g = V.setTheme; V.__tvnF = g;
    V.setTheme = function (t) { g.call(V, t); if (!tu) { ghi(t === "light" || t === "dark" ? t : "auto"); veVm(thuc(chon())); veNut(); } };
    return g;
  }
  // Vĩ mô mở thẳng: như bản nhúng, luật tối của ô Đọc nhanh chỉ xét data-mode trên html, nên gắn data-mode và data-theme theo giao diện thật (rà 05/11/2026)
  function veVm(e) { if (APP === "vimo" && (e === "light" || e === "dark")) { R.setAttribute("data-mode", e); R.setAttribute("data-theme", e); } }
  function apDung() {
    var t = chon(), e = thuc(t);
    tu = true;
    try {
      R.setAttribute("data-tvnf", e);
      if (APP === "hub") R.setAttribute("data-theme", e);   // "tvn-theme" nay do ghi() giữ (chỉ khi chọn hẳn sáng hay tối), để chế độ theo máy không bị khóa cứng
      else if (APP === "thegioi") {   // dùng đường đổi giao diện sẵn có của trang (postMessage cùng nguồn) để nút và màu khớp nhau
        if (e === "light") R.dataset.ve = "sang"; else delete R.dataset.ve;
        try { localStorage.setItem("tvn-tg-ve", e === "light" ? "sang" : "toi"); } catch (x) { /* bỏ */ }
        try { window.postMessage({tvn: "ve", ve: e === "light" ? "sang" : "toi"}, location.origin); } catch (x) { /* bỏ */ }
      } else if (APP === "vimo") { var g = moc(); if (g) g.call(window.VM, t); veVm(e); }
    } finally { tu = false; }
    veNut();
  }
  function veNut() {
    var b = document.getElementById("tvnF-ve"); if (!b) return;
    var toi = thuc(chon()) === "dark";
    b.textContent = toi ? "☀" : "☾";
    b.title = toi ? "Chuyển sang nền sáng" : "Chuyển sang nền tối";
    b.setAttribute("aria-label", b.title);
  }
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (chon() === "auto") apDung(); });
  window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === KEY_IN) apDung(); });   // đổi ở tab TVN Insight khác
  if (APP === "thegioi") {   // nút ☀ riêng của Thế giới (nếu còn) đổi thì ghi lại
    new MutationObserver(function () { if (!tu) { ghi(R.dataset.ve === "sang" ? "light" : "dark"); veNut(); } })
      .observe(R, {attributes: true, attributeFilter: ["data-ve"]});
  }

  // ---------- giao diện khung ----------
  var css = document.createElement("style");
  css.id = "tvnF-css";
  css.textContent = [
    "#tvnF-dau{position:sticky;top:0;z-index:80;background:#16294A;color:#fff;border-bottom:1px solid rgba(227,192,112,.55);font:14px/1.3 system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;box-shadow:0 4px 14px rgba(8,16,32,.18);padding-top:env(safe-area-inset-top,0px)}",
    "#tvnF-dau *{box-sizing:border-box}",
    "#tvnF-dau .tvnF-in{max-width:1280px;margin:0 auto;display:flex;align-items:center;gap:10px;min-height:50px;padding:6px max(12px,env(safe-area-inset-right,0px)) 6px max(12px,env(safe-area-inset-left,0px))}",
    "#tvnF-dau a{color:inherit;text-decoration:none}",
    "#tvnF-dau .tvnF-ve{flex:none;color:#E3C070;font-weight:700;font-size:13px;letter-spacing:.02em;white-space:nowrap;padding:6px 2px}",
    "#tvnF-dau .tvnF-ten{flex:1 1 auto;min-width:0;font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:10px;border-left:1px solid rgba(227,192,112,.35)}",
    "#tvnF-dau .tvnF-tab{display:none;gap:2px;flex:none}",
    "#tvnF-dau .tvnF-tab a{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:8px;color:#C9D2E3;font-weight:600;font-size:13px;white-space:nowrap}",
    "#tvnF-dau .tvnF-tab a:hover{background:rgba(255,255,255,.07);color:#fff}",
    "#tvnF-dau .tvnF-tab a[aria-current]{color:#E3C070;background:rgba(227,192,112,.12)}",
    "#tvnF-dau .tvnF-tab svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
    "#tvnF-dau .tvnF-nut{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:36px;height:34px;padding:0 9px;border-radius:999px;border:1px solid rgba(227,192,112,.45);background:transparent;color:#fff;font:600 13px/1 system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;cursor:pointer;white-space:nowrap}",
    "#tvnF-dau .tvnF-nut:hover{background:rgba(255,255,255,.08)}",
    "#tvnF-dau .tvnF-nut .tvnF-c{display:none}",
    "#tvnF-chip:empty{display:none}#tvnF-chip{flex:none;display:flex}#tvnF-chip .tvnA-chip{border-color:rgba(227,192,112,.6);max-width:44vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#tvnF-dau a:focus-visible,#tvnF-dau button:focus-visible,#tvnF-day button:focus-visible,#tvnF-day a:focus-visible{outline:2px solid #E3C070;outline-offset:2px}",
    "#tvnF-day{display:none}",
    "@media (min-width:761px){#tvnF-dau .tvnF-tab{display:flex}#tvnF-dau .tvnF-nut .tvnF-c{display:inline}}",
    "@media (min-width:761px) and (max-width:1080px){#tvnF-dau .tvnF-tab svg{display:none}#tvnF-dau .tvnF-tab a{padding:7px 7px}}",
    "@media (max-width:760px){",
    " #tvnF-day{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:80;background:#13213B;border-top:1px solid rgba(227,192,112,.32);padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 28px rgba(8,16,32,.28);font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}",
    " #tvnF-day a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px 1px 4px;min-height:54px;color:#AEB9CF;font:600 12px/1.1 system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;text-decoration:none;position:relative;text-align:center;-webkit-tap-highlight-color:transparent}",
    " #tvnF-day svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}",
    " #tvnF-day a[aria-current]{color:#E3C070}",
    " #tvnF-day a[aria-current]::before{content:'';position:absolute;top:-6px;left:26%;right:26%;height:3px;border-radius:0 0 3px 3px;background:#E3C070}",
    " #tvnF-day a:active{background:rgba(255,255,255,.06);border-radius:12px}",
    " body{padding-bottom:calc(78px + env(safe-area-inset-bottom,0px))}",
    "}",
    "@media (max-width:380px){#tvnF-dau .tvnF-ve{font-size:12px}#tvnF-dau .tvnF-ten{font-size:14px;padding-left:8px}#tvnF-dau .tvnF-in{gap:7px}}",
    "@media print{#tvnF-dau,#tvnF-day{display:none!important}}",
    // --- Hub: thanh đầu của khung thay đầu trang riêng; menu riêng của Hub nằm ngay dưới thanh đầu, cả trên điện thoại
    "html.tvnF-hub header.top,html.tvnF-hub .slogan{display:none!important}",
    "@media (max-width:720px){html.tvnF-hub .appnav{position:sticky!important;top:var(--tvnF-h,50px)!important;bottom:auto!important;z-index:70!important;border-top:0!important;border-bottom:1px solid var(--line)!important;box-shadow:0 6px 14px rgba(8,16,32,.08)}",
    " html.tvnF-hub .appnav a{flex-direction:row!important;gap:5px!important;padding:11px 2px!important;font-size:12.5px!important;white-space:nowrap!important}html.tvnF-hub .appnav a svg{width:17px!important;height:17px!important;flex:none}}",
    "@media (min-width:721px){html.tvnF-hub .appnav{position:sticky;top:var(--tvnF-h,50px);z-index:70}}",
    // --- Vĩ mô: bỏ nút về riêng (khung đã có), menu riêng lên dưới thanh đầu, thẻ trên máy tính dính dưới thanh đầu
    "html.tvnF-vimo #vmBack,html.tvnF-vimo #vmBackF{display:none!important}",
    "html.tvnF-vimo .vm-tabs{top:var(--tvnF-h,50px)!important}",
    // dải thương hiệu cố định trên cùng của Vĩ mô (điện thoại) nhường chỗ cho thanh đầu của khung
    "@media (max-width:560px){html.tvnF-vimo body>a[href='https://tvnpartners.com.vn'][data-noi18n]{display:none!important}html.tvnF-vimo body{padding-top:0!important}}",
    "@media (max-width:760px){html.tvnF-vimo .app-bar{position:sticky!important;top:var(--tvnF-h,50px)!important;bottom:auto!important;z-index:75!important;padding:3px 4px!important;border-top:0!important;border-bottom:1px solid var(--app-bar-line)!important;box-shadow:0 10px 24px -14px rgba(0,0,0,.55)!important}",
    " html.tvnF-vimo .app-bar{font-family:var(--font-anthropic-sans,'Be Vietnam Pro',system-ui,sans-serif)!important}",
    " html.tvnF-vimo .app-bar button{font-family:inherit!important;min-height:44px!important;gap:2px!important;padding:3px 2px!important}html.tvnF-vimo .app-bar svg{width:19px!important;height:19px!important}",
    " html.tvnF-vimo .qa-fab{bottom:calc(84px + env(safe-area-inset-bottom,0px))!important}html.tvnF-vimo .qa-fab.up{bottom:calc(150px + env(safe-area-inset-bottom,0px))!important}",
    " html.tvnF-vimo .sim-dock{bottom:calc(78px + env(safe-area-inset-bottom,0px))!important}}",
    // --- Thế giới: bỏ nút về và nút ☀ riêng (khung đã có), giữ đầu trang phòng theo dõi
    "html.tvnF-thegioi #backLink,html.tvnF-thegioi .backf,html.tvnF-thegioi #veBtn{display:none!important}",
    // html, body đều overflow-x:hidden làm body thành khung cuộn riêng, thanh đầu không dính được: đổi sang clip (cùng tác dụng chặn tràn ngang)
    "html.tvnF-thegioi,html.tvnF-thegioi body{overflow-x:clip!important}"
  ].join("\n");
  (document.head || R).appendChild(css);

  function dung() {
    if (document.getElementById("tvnF-dau")) return;
    var b = document.body;
    var hd = document.createElement("header");
    hd.id = "tvnF-dau"; hd.setAttribute("data-noi18n", "");
    hd.innerHTML = '<div class="tvnF-in">' +
      '<a class="tvnF-ve" href="' + GOC + '">‹ TVN Insight</a>' +
      '<b class="tvnF-ten">' + esc(TEN) + "</b>" +
      '<nav class="tvnF-tab" aria-label="TVN Insight">' + MUC.map(function (m) {
        return '<a href="' + GOC + "#" + m[0] + '"' + (m[0] === DANG ? ' aria-current="page"' : "") + ">" + svg(IC[m[0]]) + "<span>" + m[1] + "</span></a>";
      }).join("") + "</nav>" +
      '<a class="tvnF-nut" href="' + GOC + '?map=1" title="Sơ đồ TVN Insight" aria-label="Sơ đồ TVN Insight">🗺<span class="tvnF-c">Sơ đồ</span></a>' +
      '<button type="button" class="tvnF-nut" id="tvnF-ve"></button>' +
      '<span id="tvnF-chip"></span></div>';
    b.insertBefore(hd, b.firstChild);
    var nv = document.createElement("nav");
    nv.id = "tvnF-day"; nv.setAttribute("aria-label", "TVN Insight"); nv.setAttribute("data-noi18n", "");
    nv.innerHTML = MUC.map(function (m) {
      return '<a href="' + GOC + "#" + m[0] + '"' + (m[0] === DANG ? ' aria-current="page"' : "") + ">" + svg(IC[m[0]]) + "<span>" + m[1] + "</span></a>";
    }).join("");
    b.appendChild(nv);
    document.getElementById("tvnF-ve").addEventListener("click", function () {
      ghi(thuc(chon()) === "dark" ? "light" : "dark"); apDung();
    });
    // chiều cao thanh đầu cho các phần dính bên dưới
    var cao = function () { R.style.setProperty("--tvnF-h", hd.offsetHeight + "px"); };
    cao(); if ("ResizeObserver" in window) new ResizeObserver(cao).observe(hd); else addEventListener("resize", cao);
    sapXep();
    new MutationObserver(sapXep).observe(b, {childList: true});
    apDung();
  }
  // Giữ thanh đầu trên cùng: dải thông báo tài khoản nằm dưới nó; nút tài khoản đã vẽ trước khi có khung thì đưa vào khung;
  // Vĩ mô: menu riêng (.app-bar) dời lên ngay dưới thanh đầu để dính được.
  function sapXep() {
    var hd = document.getElementById("tvnF-dau"); if (!hd) return;
    var b = document.body;
    if (b.firstChild !== hd) b.insertBefore(hd, b.firstChild);
    var dai = document.getElementById("tvnA-dai");
    if (dai && dai.previousElementSibling !== hd) hd.after(dai);
    var chip = document.getElementById("tvnA-chip"), o = document.getElementById("tvnF-chip");
    if (chip && o && chip.parentNode !== o && (chip.parentNode === b || (chip.closest && chip.closest("header.top")))) { chip.classList.add("trong"); o.appendChild(chip); }
    if (APP === "vimo") {
      var ab = document.querySelector(".app-bar");
      var sau = dai && dai.previousElementSibling === hd ? dai : hd;
      if (ab && ab.previousElementSibling !== sau) sau.after(ab);
      moc();
    }
  }
  if (document.body) dung(); else document.addEventListener("DOMContentLoaded", dung);
  addEventListener("load", function () { if (APP === "vimo" && !(window.VM && window.VM.__tvnF)) apDung(); sapXep(); });
})();
