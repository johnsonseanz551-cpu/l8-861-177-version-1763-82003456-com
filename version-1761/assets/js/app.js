(function () {
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }

        if (window.scrollY > 12) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                showSlide(Number(thumb.getAttribute('data-hero-thumb')) || 0);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                schedule();
            });
        }

        schedule();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));
    var clearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-clear]'));
    var activeFilters = {};

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function queryFromUrl() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function activeQuery() {
        if (!searchInputs.length) {
            return '';
        }

        return normalize(searchInputs[0].value);
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = activeQuery();

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search-text') || card.textContent);
            var matchesText = !query || text.indexOf(query) !== -1;
            var matchesFilters = Object.keys(activeFilters).every(function (field) {
                var expected = activeFilters[field];
                return !expected || normalize(card.getAttribute('data-' + field)) === normalize(expected);
            });

            card.classList.toggle('is-hidden', !(matchesText && matchesFilters));
        });
    }

    if (searchInputs.length) {
        var initialQuery = queryFromUrl();

        searchInputs.forEach(function (input) {
            if (initialQuery && !input.value) {
                input.value = initialQuery;
            }

            input.addEventListener('input', applyFilters);
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var field = button.getAttribute('data-filter-field');
            var value = button.getAttribute('data-filter-value');

            filterButtons.forEach(function (item) {
                if (item.getAttribute('data-filter-field') === field) {
                    item.classList.remove('is-active');
                }
            });

            clearButtons.forEach(function (item) {
                item.classList.remove('is-active');
            });

            if (activeFilters[field] === value) {
                delete activeFilters[field];
                button.classList.remove('is-active');
            } else {
                activeFilters[field] = value;
                button.classList.add('is-active');
            }

            applyFilters();
        });
    });

    clearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilters = {};
            filterButtons.forEach(function (item) {
                item.classList.remove('is-active');
            });
            clearButtons.forEach(function (item) {
                item.classList.add('is-active');
            });
            applyFilters();
        });
    });

    applyFilters();
})();
