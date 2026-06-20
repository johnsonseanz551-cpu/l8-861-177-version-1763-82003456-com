(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileMenu = document.querySelector('[data-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let activeIndex = 0;
        let timer = null;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        const restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    const searchInput = document.querySelector('[data-site-search]');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    let activeFilter = 'all';

    const normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    const applyFilters = function () {
        if (!cards.length) {
            return;
        }

        const query = searchInput ? normalize(searchInput.value) : '';

        cards.forEach(function (card) {
            const text = normalize(card.getAttribute('data-search'));
            const matchesQuery = !query || text.indexOf(query) !== -1;
            const matchesFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
            card.hidden = !(matchesQuery && matchesFilter);
        });
    };

    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (initialQuery) {
            searchInput.value = initialQuery;
        }

        searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            applyFilters();
        });
    });

    applyFilters();
})();
