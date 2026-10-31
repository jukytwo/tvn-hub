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
    if (th === "light" || th === "dark") {
      R.setAttribute("data-tvnf", th);
      if (APP === "hub") R.setAttribute("data-theme", th);
      else if (APP === "vimo") { var datVm = function () { var V = window.VM; if (V && typeof V.setTheme === "function") { V.setTheme(th); return true; } return false; };
        if (!datVm()) { var n = 0, t = setInterval(function () { if (datVm() || ++n > 40) clearInterval(t); }, 150); } }
    }
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
      document.addEventListener("toggle", doi, true); doi(); };
    if (document.body) bat(); else document.addEventListener("DOMContentLoaded", bat);
    addEventListener("load", function () { cu = 0; doi(); setTimeout(function () { cu = 0; doi(); }, 800); });
  }

  // ---------- sửa giao diện theo đánh giá UI/UX 27/10/2026 (thư i-20261027-ux4v, m-20261027-ux7k); chạy cả khi trang nằm trong khung nhúng ----------
  function suaTrang() {
    var c = [
      // vùng chạm của thanh đầu khung
      "#tvnF-dau .tvnF-ve{display:inline-flex;align-items:center;min-height:40px}#tvnF-dau .tvnF-tab a{min-height:36px}"
    ];
    if (APP === "hub") {
      // Báo cáo (khoi=bc) trên máy tính: thẻ 2 cột, nhãn loại, ngày, tiêu đề đậm, 2 dòng tóm tắt, dòng không quá ~90 ký tự
      c.push("@media (min-width:900px){#lib{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:stretch}" +
        "#lib .libitem{display:flex!important;flex-direction:column;align-items:flex-start;gap:6px;height:100%;text-align:left;padding:14px 16px!important;margin:0!important;border:1px solid var(--line,#D6DDE7)!important;border-radius:14px!important;background:var(--card,#fff)!important;box-sizing:border-box}" +
        "#lib .libitem:hover{border-color:#C8992F!important}" +
        "#lib .libitem>.tvnS-meta{order:0;display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12px}" +
        "#lib .libitem>b{order:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:15px;line-height:1.4;max-width:62ch}" +
        "#lib .libitem>span:not(.tvnS-meta){order:2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:90ch;line-height:1.45}" +
        "#lib .libitem>span.muted{display:none}}" +
        ".tvnS-loai{display:inline-block;padding:2px 9px;border-radius:999px;background:rgba(200,153,47,.14);color:#8A6412;font-weight:700;font-size:11.5px;letter-spacing:.02em}" +
        ".tvnS-meta .tvnS-ngay{color:var(--muted,#566173)}" +
        "@media (max-width:899px){.tvnS-meta{display:none!important}}");
      var LOAI = {vm: "Thị trường và Chính phủ", dn: "Cổ phiếu", cq: "Cổ phiếu", ng: "Ngành"};
      var the = function () {
        var lib = document.getElementById("lib"); if (!lib) return;
        Array.prototype.forEach.call(lib.querySelectorAll(".libitem"), function (b) {
          if (b.querySelector(".tvnS-meta")) return;
          var m = b.querySelector("span.muted"); if (!m) return;
          var p = m.textContent.split(" · "), ngay = (p[p.length - 1] || "").replace(/^(\d\d:\d\d):\d\d /, "$1 ");
          var t0 = p[0] || "", loai = /Thị trường và Chính phủ/.test(t0) ? "Thị trường và Chính phủ" : /ngành/i.test(t0) ? "Ngành" : /cổ phiếu|doanh nghiệp/i.test(t0) ? "Cổ phiếu" : /hỏi/i.test(t0) ? "Hỏi đáp" : (LOAI[(b.dataset.id || "").split("-")[0]] || t0);
          var chu = p.length > 1 ? p.slice(0, -1).join(" · ") : "";
          var d = document.createElement("span"); d.className = "tvnS-meta";
          d.innerHTML = '<span class="tvnS-loai"></span><span class="tvnS-ngay"></span>';
          d.firstChild.textContent = loai; d.lastChild.textContent = (chu && chu !== loai ? chu + " · " : "") + ngay;
          b.insertBefore(d, b.firstChild);
        });
      };
      var hen = function () { the(); var lib = document.getElementById("lib"); if (lib && !lib.__tvnS) { lib.__tvnS = 1; new MutationObserver(the).observe(lib, {childList: true}); } };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hen); else hen();
      addEventListener("load", function () { setTimeout(hen, 300); setTimeout(hen, 1500); });
    }
    if (APP === "thegioi") {
      c.push(
        // kiểu chữ máy đánh chữ chỉ còn cho con số; tiêu đề, nhãn, nút dùng chữ thường của trang
        "html body .p .ph h2,html body .badge,html body .jump a,html body .btn,html body .dn-h,html body .dn-h b,html body .p .ph .r,html body .seg button,html body .rows .sub,html body .rows h3,html body .rows .grp{font-family:var(--f-sans,'Be Vietnam Pro',system-ui,sans-serif)!important}",
        "html body .p .ph h2{letter-spacing:.06em}",
        // điện thoại: khối dài thu còn ~420px kèm nút Xem đủ (Thị trường toàn cầu thêm vào nhóm này)
        "@media (max-width:760px){html body .p.cap:not(.open) .pb{position:relative;max-height:420px!important;overflow:hidden!important}" +
        "html body .p.cap:not(.open) .pb::after{content:'';position:absolute;left:0;right:0;bottom:0;height:56px;background:linear-gradient(transparent,var(--panel,#fff));pointer-events:none}" +
        "html body .capb:not([hidden]){display:block!important;margin:0 10px 10px}}"
      );
      var tg = function () {
        var mk = document.getElementById("thi-truong");
        if (mk && !mk.__tvnS) {
          mk.__tvnS = 1; mk.classList.add("cap");
          var b = document.createElement("button"); b.type = "button"; b.className = "btn capb tvnS-capb"; b.textContent = "XEM ĐỦ";
          b.addEventListener("click", function () {
            var mo = mk.classList.toggle("open"); b.textContent = mo ? "THU GỌN" : "XEM ĐỦ";
            if (!mo) mk.scrollIntoView({block: "start"});
          });
          mk.appendChild(b);
        }
        // khối Việt Nam: ghi kỳ công bố kế tiếp thay ngày rút số (số trong khối vẫn là kỳ mới nhất)
        var vn = document.getElementById("vnNote");
        if (vn && !vn.__tvnS) {
          vn.__tvnS = 1;
          fetch(new URL("../data/the_gioi.json", location.href).href, {cache: "no-store"}).then(function (r) { return r.json(); }).then(function (d) {
            var lich = ((d.viet_nam || {}).lich || []), nay = new Date().toISOString().slice(0, 10);
            var ten = function (x) { return /PMI/.test(x.ten) ? "PMI" : /Thống kê/.test(x.co_quan || x.ten) ? "Cục Thống kê" : /Hải quan/.test(x.co_quan || x.ten) ? "Hải quan" : (x.co_quan || x.ten); };
            var sau = lich.filter(function (x) { return x.ngay >= nay; }).slice(0, 2).map(function (x) { return ten(x) + " " + x.ngay.slice(8, 10) + "/" + x.ngay.slice(5, 7); });
            if (!sau.length) return;
            var chu = "số mới nhất đã công bố · kỳ sau: " + sau.join(", ");
            var dat = function () {   // trang vẽ lại khối Việt Nam sau khi tải số thì ghi lại
              var e = document.getElementById("vnNote"); if (!e || e.textContent === chu) return;
              e.textContent = chu; e.title = "Số trong khối là kỳ mới nhất đã công bố; ngày rút số " + ((d.viet_nam || {}).cap_nhat || "");
            };
            dat();
            var khoi = document.getElementById("viet-nam") || document.body;
            new MutationObserver(dat).observe(khoi, {childList: true, subtree: true, characterData: true});
          }).catch(function () { /* giữ nguyên dòng cũ */ });
        }
      };
      var hen2 = function () { tg(); };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hen2); else hen2();
      addEventListener("load", function () { setTimeout(hen2, 500); setTimeout(hen2, 2000); });
    }
    var st = document.createElement("style"); st.id = "tvnS-css"; st.textContent = c.join("\n");
    (document.head || R).appendChild(st);
  }
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
