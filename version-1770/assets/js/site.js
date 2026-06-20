(() => {
    const body = document.body;
    const navToggle = document.querySelector('[data-nav-toggle]');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            body.classList.toggle('nav-open');
        });
    }

    document.querySelectorAll('.nav-menu a').forEach((link) => {
        link.addEventListener('click', () => {
            body.classList.remove('nav-open');
        });
    });

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    let heroIndex = 0;
    let heroTimer = null;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === heroIndex);
        });
    };

    const startHero = () => {
        if (heroTimer) {
            clearInterval(heroTimer);
        }

        if (slides.length > 1) {
            heroTimer = setInterval(() => showSlide(heroIndex + 1), 5000);
        }
    };

    if (slides.length) {
        showSlide(0);
        startHero();

        if (prev) {
            prev.addEventListener('click', () => {
                showSlide(heroIndex - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                showSlide(heroIndex + 1);
                startHero();
            });
        }

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.heroDot || 0));
                startHero();
            });
        });
    }

    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach((panel) => {
        const input = panel.querySelector('[data-card-search]');
        const buttons = Array.from(panel.querySelectorAll('[data-filter-value]'));
        const grid = panel.parentElement.querySelector('[data-card-grid]');
        const cards = grid ? Array.from(grid.querySelectorAll('[data-search-card]')) : [];
        let selected = '';

        const applyFilter = () => {
            const query = input ? input.value.trim().toLowerCase() : '';

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(' ').toLowerCase();

                const queryMatch = !query || haystack.includes(query);
                const selectedMatch = !selected || haystack.includes(selected.toLowerCase());
                card.classList.toggle('is-hidden', !(queryMatch && selectedMatch));
            });
        };

        if (input) {
            const params = new URLSearchParams(window.location.search);
            const initial = params.get('q');

            if (initial) {
                input.value = initial;
            }

            input.addEventListener('input', applyFilter);
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                selected = button.dataset.filterValue || '';
                buttons.forEach((item) => item.classList.toggle('is-active', item === button));
                applyFilter();
            });
        });

        applyFilter();
    });

    document.querySelectorAll('[data-player-jump]').forEach((link) => {
        link.addEventListener('click', () => {
            const button = document.querySelector('.player-overlay');
            if (button) {
                setTimeout(() => button.click(), 120);
            }
        });
    });
})();
