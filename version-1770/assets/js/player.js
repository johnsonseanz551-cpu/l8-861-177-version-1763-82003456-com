const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('.player-overlay');
    const message = player.querySelector('.player-message');
    const stream = player.dataset.stream;
    let hlsInstance = null;
    let loading = null;

    const setMessage = (text) => {
        if (message) {
            message.textContent = text || '';
        }
    };

    const attachStream = async () => {
        if (!video || !stream) {
            setMessage('视频暂时无法播放');
            return false;
        }

        if (player.dataset.ready === '1') {
            return true;
        }

        if (loading) {
            return loading;
        }

        loading = (async () => {
            setMessage('');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                player.dataset.ready = '1';
                return true;
            }

            try {
                const module = await import('./hls-vendor-dru42stk.js');
                const Hls = module.H;

                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    player.dataset.ready = '1';
                    return true;
                }
            } catch (error) {
                setMessage('视频暂时无法播放');
                return false;
            }

            setMessage('视频暂时无法播放');
            return false;
        })();

        return loading;
    };

    const startPlayback = async () => {
        const ready = await attachStream();

        if (!ready || !video) {
            return;
        }

        player.classList.add('is-started');

        try {
            await video.play();
            player.classList.add('is-playing');
        } catch (error) {
            player.classList.remove('is-playing');
        }
    };

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', () => {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', () => {
            player.classList.add('is-playing');
            player.classList.add('is-started');
        });

        video.addEventListener('pause', () => {
            player.classList.remove('is-playing');
        });

        video.addEventListener('ended', () => {
            player.classList.remove('is-playing');
            player.classList.remove('is-started');
        });
    }

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
});
