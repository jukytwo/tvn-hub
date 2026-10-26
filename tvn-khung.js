/* Khung chung TVN Insight cho Thế giới, Vĩ mô, Hub khi mở riêng (anh Vũ yêu cầu làm ngay 25/10/2026, thư i-20261025-g7nk).
 * Đăng tại https://jukytwo.github.io/tvn-hub/tvn-khung.js (cùng miền với ba trang), nạp bằng:
 *   <script src="/tvn-hub/tvn-khung.js" data-app="hub|vimo|thegioi" data-ten="Tên trang" defer></script>
 * - Thanh đầu nền #16294A viền vàng mảnh: ‹ TVN Insight, tên trang, (máy tính) 5 mục của TVN Insight, 🗺 Sơ đồ, nút sáng tối,
 *   chỗ cho nút tài khoản (#tvnF-chip, tvn-auth.js đặt vào qua data-chip).
 * - Điện thoại (đến 760px): thanh 5 mục dưới đáy giống TVN Insight; menu riêng của trang chuyển lên ngay dưới thanh đầu.
 * - Sáng tối theo localStorage tvn_dash_theme (light, dark, còn lại là theo máy), đổi ở đây thì TVN Insight cũng đổi.
 * - Nhúng (?embed=1 hoặc nằm trong iframe): không làm gì, vỏ TVN Insight đã có đầu trang và menu.
 * Nguồn: radar/hub/tvn-khung.js trong kho tvn-hermes-bot; bản đăng là bản chép nguyên văn.
 */
(function () {
  "use strict";
  var S = document.currentScript || document.querySelector("script[src*='tvn-khung.js']");
  var APP = (S && S.dataset.app) || "", TEN = (S && S.dataset.ten) || document.title;
  var R = document.documentElement, q = new URLSearchParams(location.search);
  var nhung = q.get("embed") === "1";
  try { nhung = nhung || window.self !== window.top; } catch (e) { nhung = true; }
  if (nhung || window.__tvnKhung) return;
  window.__tvnKhung = 1;
  R.classList.add("tvnF", "tvnF-" + APP);

  var GOC = "https://jukytwo.github.io/bantin/";
  var MUC = [["homnay", "Hôm nay"], ["thitruong", "Thị trường"], ["bantin", "Bản tin"], ["phantich", "Công cụ"], ["khuyennghi", "Khuyến nghị"]];
  var DANG = {hub: "phantich", vimo: "phantich", thegioi: "thitruong"}[APP] || "";
  var IC = {   // cùng bộ biểu tượng menu dưới của TVN Insight
    homnay: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    thitruong: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    bantin: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    phantich: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
    khuyennghi: '<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z"/>'
  };
  var svg = function (p) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + "</svg>"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); };

  // ---------- sáng tối ----------
  var KEY = "tvn_dash_theme", mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null, tu = false;
  function chon() { try { var t = localStorage.getItem(KEY); return t === "light" || t === "dark" ? t : "auto"; } catch (e) { return "auto"; } }
  function thuc(t) { return t === "auto" ? (mq && mq.matches ? "dark" : "light") : t; }
  function ghi(t) { try { if (t === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, t); } catch (e) { /* bỏ */ } }
  function moc() {   // Vĩ mô: mọi lần đổi giao diện trong trang (bảng Thêm, Cài đặt) ghi luôn vào tvn_dash_theme
    var V = window.VM;
    if (APP !== "vimo" || !V || typeof V.setTheme !== "function" || V.__tvnF) return V && V.__tvnF;
    var g = V.setTheme; V.__tvnF = g;
    V.setTheme = function (t) { g.call(V, t); if (!tu) { ghi(t === "light" || t === "dark" ? t : "auto"); veNut(); } };
    return g;
  }
  function apDung() {
    var t = chon(), e = thuc(t);
    tu = true;
    try {
      R.setAttribute("data-tvnf", e);
      if (APP === "hub") { R.setAttribute("data-theme", e); try { localStorage.setItem("tvn-theme", e); } catch (x) { /* bỏ */ } }
      else if (APP === "thegioi") {   // dùng đường đổi giao diện sẵn có của trang (postMessage cùng nguồn) để nút và màu khớp nhau
        if (e === "light") R.dataset.ve = "sang"; else delete R.dataset.ve;
        try { localStorage.setItem("tvn-tg-ve", e === "light" ? "sang" : "toi"); } catch (x) { /* bỏ */ }
        try { window.postMessage({tvn: "ve", ve: e === "light" ? "sang" : "toi"}, location.origin); } catch (x) { /* bỏ */ }
      } else if (APP === "vimo") { var g = moc(); if (g) g.call(window.VM, t); }
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
  window.addEventListener("storage", function (e) { if (e.key === KEY) apDung(); });   // đổi ở tab TVN Insight khác
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
