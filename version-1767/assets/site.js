(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilterBars() {
    var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
    bars.forEach(function (bar) {
      var grid = bar.parentElement.querySelector('.filter-grid');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      bar.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-filter]');
        if (!button) {
          return;
        }
        var filter = button.getAttribute('data-filter');
        Array.prototype.slice.call(bar.querySelectorAll('button')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ');
          card.classList.toggle('is-filtered-out', filter !== 'all' && text.indexOf(filter) === -1);
        });
      });
    });
  }

  function initSearchPage() {
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    if (!input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var cards = Array.prototype.slice.call(results.querySelectorAll('.movie-card'));
    input.value = initial;

    function apply() {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        card.classList.toggle('is-search-hidden', query && text.indexOf(query) === -1);
      });
    }

    input.addEventListener('input', apply);
    apply();
  }

  function createPlayer(videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !sourceUrl) {
      return;
    }
    var hls = null;
    var loaded = false;

    function hideOverlay() {
      overlay.classList.add('is-hidden');
    }

    function showOverlay() {
      overlay.classList.remove('is-hidden');
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          showOverlay();
        });
      }
    }

    function attachThenPlay() {
      hideOverlay();
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
      }
    }

    overlay.addEventListener('click', attachThenPlay);
    video.addEventListener('click', function () {
      if (!loaded) {
        attachThenPlay();
      }
    });
    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', showOverlay);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilterBars();
    initSearchPage();
  });

  window.SitePlayer = {
    create: createPlayer
  };
}());
