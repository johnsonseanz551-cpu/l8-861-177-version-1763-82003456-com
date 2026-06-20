(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".nav-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupSearchForms() {
    Array.prototype.forEach.call(document.querySelectorAll(".js-search-form"), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (input && input.value.trim()) {
          event.preventDefault();
          window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
        }
      });
    });
  }

  function setupFilters() {
    var bar = document.querySelector("[data-filter-bar]");
    var list = document.querySelector("[data-filter-list]");
    if (!bar || !list) {
      return;
    }
    var keyword = bar.querySelector("[data-filter-keyword]");
    var type = bar.querySelector("[data-filter-type]");
    var year = bar.querySelector("[data-filter-year]");
    var empty = document.querySelector("[data-empty-tip]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    if (keyword && params.get("q")) {
      keyword.value = params.get("q");
    }
    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var match = true;
        if (q && text.indexOf(q) === -1) {
          match = false;
        }
        if (t && cardType !== t) {
          match = false;
        }
        if (y && cardYear !== y) {
          match = false;
        }
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
  });
})();
