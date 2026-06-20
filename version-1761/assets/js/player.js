(function () {
    window.createMoviePlayer = function (streamUrl) {
        var player = document.querySelector('[data-player]');
        var video = document.getElementById('movie-video');

        if (!player || !video || !streamUrl) {
            return;
        }

        var overlay = player.querySelector('.player-overlay');
        var prepared = false;
        var activeHls = null;

        function attachStream() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                activeHls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                activeHls.loadSource(streamUrl);
                activeHls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback() {
            attachStream();
            player.classList.add('is-playing');
            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });

        video.addEventListener('ended', function () {
            player.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (activeHls && typeof activeHls.destroy === 'function') {
                activeHls.destroy();
            }
        });
    };
})();
