(function () {
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  if (!window.SNAP) return;

  document.querySelectorAll("[data-version]").forEach(function (node) {
    node.textContent = window.SNAP.version;
  });

  document.querySelectorAll("[data-download]").forEach(function (node) {
    var item = window.SNAP.downloads[node.getAttribute("data-download")];
    if (!item || !item.href) return;
    node.setAttribute("href", item.href);
    var file = node.querySelector("[data-file]");
    if (file && item.file) file.textContent = item.file;
  });
})();
