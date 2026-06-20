import { H as Hls } from "./hls-vendor.js";

export function initMoviePlayer(videoId, overlayId, source) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);

    if (!video || !overlay || !source) {
        return;
    }

    let loaded = false;
    let hls = null;

    const loadVideo = function () {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    overlay.classList.remove("is-hidden");
                    overlay.innerHTML = "<strong>暂时无法播放，请稍后再试</strong>";
                }
            });
        } else {
            overlay.innerHTML = "<strong>暂时无法播放，请稍后再试</strong>";
        }
    };

    const start = function () {
        loadVideo();
        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        video.play().catch(function () {
            overlay.classList.remove("is-hidden");
        });
    };

    overlay.addEventListener("click", start);

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
