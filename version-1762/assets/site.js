(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function closeSearchPanels(except) {
        selectAll('.site-search-panel.open').forEach(function (panel) {
            if (panel !== except) {
                panel.classList.remove('open');
                panel.innerHTML = '';
            }
        });
    }

    function renderSearch(input) {
        var panel = input.parentElement.querySelector('.site-search-panel');
        if (!panel) {
            return;
        }
        var query = input.value.trim().toLowerCase();
        if (!query) {
            panel.classList.remove('open');
            panel.innerHTML = '';
            return;
        }
        var data = window.SEARCH_INDEX || [];
        var results = [];
        for (var i = 0; i < data.length; i += 1) {
            var item = data[i];
            var haystack = [item.title, item.region, item.year, item.category, item.tags].join(' ').toLowerCase();
            if (haystack.indexOf(query) !== -1) {
                results.push(item);
            }
            if (results.length >= 12) {
                break;
            }
        }
        if (!results.length) {
            panel.innerHTML = '<div class="empty-result">没有找到匹配内容</div>';
            panel.classList.add('open');
            return;
        }
        panel.innerHTML = results.map(function (item) {
            return '<a class="search-result-item" href="' + item.url + '">' +
                '<span class="search-result-title">' + escapeHtml(item.title) + '</span>' +
                '<span class="search-result-meta">' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.category) + '</span>' +
                '</a>';
        }).join('');
        panel.classList.add('open');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initSearch() {
        selectAll('.site-search-input').forEach(function (input) {
            input.addEventListener('input', function () {
                renderSearch(input);
            });
            input.addEventListener('focus', function () {
                renderSearch(input);
            });
        });
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.header-search') && !event.target.closest('.mobile-search')) {
                closeSearchPanels(null);
            }
        });
    }

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('.hero');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function initCategoryFilter() {
        var grid = document.querySelector('.movie-grid[data-filterable="true"]');
        if (!grid) {
            return;
        }
        var cards = selectAll('.movie-card', grid);
        var keyword = document.querySelector('.category-keyword');
        var year = document.querySelector('.category-year');
        var region = document.querySelector('.category-region');
        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var r = region ? region.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [card.dataset.title, card.dataset.tags, card.dataset.category, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
                var matched = true;
                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (y && card.dataset.year !== y) {
                    matched = false;
                }
                if (r && card.dataset.region !== r) {
                    matched = false;
                }
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            var empty = document.querySelector('.category-empty');
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }
        [keyword, year, region].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });
    }

    window.initMoviePlayer = function (source) {
        var shell = document.querySelector('.js-video-shell');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.play-overlay');
        var ready = false;
        var hls = null;
        function attach() {
            if (ready || !video) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            shell.classList.add('is-playing');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime <= 0) {
                shell.classList.remove('is-playing');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initSearch();
        initMobileMenu();
        initHero();
        initCategoryFilter();
    });
}());
