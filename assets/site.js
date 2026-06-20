(function() {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var header = document.querySelector("[data-site-header]");
    var button = document.querySelector("[data-menu-button]");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function() {
      header.classList.toggle("open");
      document.body.classList.toggle("menu-open", header.classList.contains("open"));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function(dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function(dot, current) {
      dot.addEventListener("click", function() {
        show(current);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function(form) {
      var section = form.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-list] .movie-card, [data-filter-list] .ranking-card"));
      var params = new URLSearchParams(window.location.search);
      var queryInput = form.querySelector('[name="q"]');

      if (queryInput && params.get("q")) {
        queryInput.value = params.get("q");
      }

      function value(name) {
        var field = form.querySelector('[name="' + name + '"]');
        return field ? field.value.trim().toLowerCase() : "";
      }

      function apply() {
        var query = value("q");
        var year = value("year");
        var region = value("region");
        var type = value("type");

        cards.forEach(function(card) {
          var text = [
            card.dataset.title || "",
            card.dataset.region || "",
            card.dataset.type || "",
            card.dataset.year || "",
            card.dataset.tags || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (year && (card.dataset.year || "").toLowerCase() !== year) {
            matched = false;
          }
          if (region && (card.dataset.region || "").toLowerCase() !== region) {
            matched = false;
          }
          if (type && (card.dataset.type || "").toLowerCase() !== type) {
            matched = false;
          }
          card.hidden = !matched;
        });
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("reset", function() {
        window.setTimeout(apply, 0);
      });
      apply();
    });
  }

  window.initializeMoviePlayer = function(playUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !playUrl) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = playUrl;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
