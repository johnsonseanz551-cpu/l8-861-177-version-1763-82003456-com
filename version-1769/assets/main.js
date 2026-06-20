
(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function activate(index) {
            current = index % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var activeFilter = '';

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.textContent
        ].join(' ').toLowerCase();
    }

    function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
            var text = cardText(card);
            var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
            var filterMatched = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.hidden = !(keywordMatched && filterMatched);
        });
    }

    if (input && cards.length) {
        input.addEventListener('input', applyFilters);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.forEach(function (item) {
                item.classList.remove('active');
            });
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter-value') || '';
            applyFilters();
        });
    });
})();
