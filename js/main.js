(function () {
  var icons = {
    crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h8"/><path d="M7 12h10"/><path d="M7 16h6"/>',
    lang: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    window: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/>',
    key: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/>',
    down: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    move: '<path d="M12 2v20"/><path d="m15 19-3 3-3-3"/><path d="m19 9 3 3-3 3"/><path d="M2 12h20"/><path d="m5 9-3 3 3 3"/><path d="m9 5 3-3 3 3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    pointer: '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>'
  };
  document.querySelectorAll("span.ico").forEach(function (node) {
    var name = "";
    node.classList.forEach(function (item) {
      if (item.indexOf("ico-") === 0) name = item.slice(4);
    });
    if (!icons[name]) return;
    var holder = document.createElement("span");
    holder.innerHTML = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + "</svg>";
    node.replaceWith(holder.firstChild);
  });

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  if (window.SNAP) {
    document.querySelectorAll("[data-version]").forEach(function (node) {
      node.textContent = window.SNAP.version;
    });
    document.querySelectorAll("[data-download]").forEach(function (node) {
      var item = window.SNAP.downloads[node.getAttribute("data-download")];
      if (!item) return;
      if (item.href) node.setAttribute("href", item.href);
      var file = node.parentElement && node.parentElement.querySelector("[data-file]");
      if (file && item.file) file.textContent = item.file;
    });
    document.querySelectorAll("[data-size]").forEach(function (node) {
      var item = window.SNAP.downloads[node.getAttribute("data-size")];
      if (!item || !item.bytes) return;
      node.textContent = (item.bytes / 1048576).toFixed(1) + " MB";
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy") || "";
      var target = document.querySelector(text);
      var value = target ? target.textContent : text;
      var done = function () {
        button.classList.add("is-done");
        window.setTimeout(function () { button.classList.remove("is-done"); }, 1200);
      };
      var fallback = function () {
        var area = document.createElement("textarea");
        area.value = value;
        document.body.appendChild(area);
        area.select();
        try { document.execCommand("copy"); done(); } catch (err) {}
        area.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  });

  var board = document.querySelector("[data-board]");
  if (!board) return;
  var layer = board.querySelector("[data-select]");
  var card = board.querySelector("[data-card]");
  var origin = null;

  function box(x, y, w, h) {
    layer.style.left = x + "px";
    layer.style.top = y + "px";
    layer.style.width = Math.max(0, w) + "px";
    layer.style.height = Math.max(0, h) + "px";
  }

  function showLine(line, rect) {
    card.hidden = false;
    card.querySelector("[data-ocr]").textContent = line.getAttribute("data-src");
    card.querySelector("[data-out]").textContent = line.getAttribute("data-dst");
    var host = board.getBoundingClientRect();
    var left = rect.right - host.left + 12;
    var top = rect.top - host.top;
    if (left + 240 > host.width) left = Math.max(8, rect.left - host.left - 248);
    if (top + 150 > host.height) top = Math.max(8, host.height - 158);
    card.style.left = left + "px";
    card.style.top = top + "px";
  }

  board.addEventListener("pointerdown", function (event) {
    if (event.button !== 0 || event.target.closest("[data-card], button, a")) return;
    var host = board.getBoundingClientRect();
    origin = { x: event.clientX, y: event.clientY };
    layer.hidden = false;
    card.hidden = true;
    board.setPointerCapture(event.pointerId);
    box(event.clientX - host.left, event.clientY - host.top, 0, 0);
  });

  board.addEventListener("pointermove", function (event) {
    if (!origin) return;
    var host = board.getBoundingClientRect();
    var x = Math.min(origin.x, event.clientX) - host.left;
    var y = Math.min(origin.y, event.clientY) - host.top;
    box(x, y, Math.abs(event.clientX - origin.x), Math.abs(event.clientY - origin.y));
  });

  board.addEventListener("pointerup", function (event) {
    if (!origin) return;
    var rect = layer.getBoundingClientRect();
    origin = null;
    if (rect.width < 12 || rect.height < 12) {
      layer.hidden = true;
      return;
    }
    var best = null;
    var bestArea = 0;
    board.querySelectorAll("[data-src]").forEach(function (line) {
      var r = line.getBoundingClientRect();
      var w = Math.max(0, Math.min(rect.right, r.right) - Math.max(rect.left, r.left));
      var h = Math.max(0, Math.min(rect.bottom, r.bottom) - Math.max(rect.top, r.top));
      if (w * h > bestArea) {
        bestArea = w * h;
        best = line;
      }
    });
    if (!best) {
      layer.hidden = true;
      return;
    }
    showLine(best, rect);
  });

  var grip = card.querySelector("[data-grip]");
  var drag = null;
  grip.addEventListener("pointerdown", function (event) {
    event.stopPropagation();
    drag = {
      x: event.clientX - card.offsetLeft,
      y: event.clientY - card.offsetTop
    };
    grip.setPointerCapture(event.pointerId);
  });
  grip.addEventListener("pointermove", function (event) {
    if (!drag) return;
    card.style.left = (event.clientX - drag.x) + "px";
    card.style.top = (event.clientY - drag.y) + "px";
  });
  grip.addEventListener("pointerup", function () { drag = null; });
  card.querySelector("[data-close]").addEventListener("click", function () {
    card.hidden = true;
    layer.hidden = true;
  });
})();
