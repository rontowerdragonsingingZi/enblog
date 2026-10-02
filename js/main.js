(function () {
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
