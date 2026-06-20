
(function () {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('play-toggle');
    var message = document.getElementById('player-message');

    if (!video || !button) {
        return;
    }

    var wrap = video.closest('.player-wrap');
    var streamUrl = video.getAttribute('data-stream');
    var initialized = false;
    var hlsInstance = null;
    var initializing = null;

    function showMessage(text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add('show');
    }

    function clearMessage() {
        if (!message) {
            return;
        }
        message.textContent = '';
        message.classList.remove('show');
    }

    function initialize() {
        if (initialized) {
            return Promise.resolve();
        }

        if (initializing) {
            return initializing;
        }

        initializing = new Promise(function (resolve) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                initialized = true;
                resolve();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    initialized = true;
                    clearMessage();
                    resolve();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        showMessage('暂时无法播放，请稍后重试');
                    }
                });
                return;
            }

            video.src = streamUrl;
            initialized = true;
            resolve();
        });

        return initializing;
    }

    function markPlaying(isPlaying) {
        if (wrap) {
            wrap.classList.toggle('is-playing', isPlaying);
        }
    }

    function startPlayback() {
        initialize().then(function () {
            var playRequest = video.play();
            if (playRequest && typeof playRequest.then === 'function') {
                playRequest.then(function () {
                    clearMessage();
                    markPlaying(true);
                }).catch(function () {
                    showMessage('点击播放按钮继续观看');
                    markPlaying(false);
                });
            } else {
                markPlaying(true);
            }
        });
    }

    button.addEventListener('click', function () {
        startPlayback();
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
            markPlaying(false);
        }
    });

    video.addEventListener('play', function () {
        markPlaying(true);
    });

    video.addEventListener('pause', function () {
        markPlaying(false);
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
