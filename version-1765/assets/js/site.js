(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;

    function show(next) {
      index = next;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(targetId) {
    var input = document.querySelector('[data-filter-target="' + targetId + '"].filter-input');
    var grid = document.getElementById(targetId);
    if (!grid) {
      return;
    }

    var query = normalize(input ? input.value : '');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-target="' + targetId + '"].filter-select'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var visible = !query || text.indexOf(query) !== -1;

      selects.forEach(function (select) {
        if (!visible) {
          return;
        }
        var field = select.getAttribute('data-select-filter');
        var value = normalize(select.value);
        if (value && normalize(card.getAttribute('data-' + field)) !== value) {
          visible = false;
        }
      });

      card.classList.toggle('is-hidden', !visible);
    });
  }

  function initFilters() {
    var controls = Array.prototype.slice.call(document.querySelectorAll('[data-filter-target]'));
    controls.forEach(function (control) {
      var targetId = control.getAttribute('data-filter-target');
      var eventName = control.tagName === 'SELECT' ? 'change' : 'input';
      control.addEventListener(eventName, function () {
        applyFilter(targetId);
      });
    });
  }

  var hlsLoader = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function initPlayer(player) {
    var video = player.querySelector('.player-video');
    var cover = player.querySelector('.player-cover');
    var state = player.querySelector('.player-state');
    var configNode = player.querySelector('.player-config');

    if (!video || !cover || !configNode) {
      return;
    }

    var config = {};
    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      config = {};
    }

    var url = config.url;
    var ready = false;
    var hlsInstance = null;

    function setState(text, hidden) {
      if (!state) {
        return;
      }
      state.textContent = text;
      state.classList.toggle('is-hidden', Boolean(hidden));
    }

    function attach() {
      if (ready || !url) {
        return Promise.resolve();
      }

      setState('正在加载...', false);

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        ready = true;
        return Promise.resolve();
      }

      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          ready = true;
          return;
        }
        throw new Error('unsupported');
      });
    }

    function start() {
      attach().then(function () {
        cover.classList.add('is-hidden');
        return video.play();
      }).then(function () {
        setState('', true);
      }).catch(function () {
        cover.classList.remove('is-hidden');
        setState('加载失败，请刷新重试', false);
      });
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('playing', function () {
      cover.classList.add('is-hidden');
      setState('', true);
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        cover.classList.remove('is-hidden');
      }
    });
    video.addEventListener('error', function () {
      setState('加载失败，请刷新重试', false);
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initPlayer);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFilters();
    initPlayers();
  });
})();
