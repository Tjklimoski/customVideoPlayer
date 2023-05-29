const playPauseBtn = document.querySelector(".play-pause-btn");
const theaterBtn = document.querySelector(".theater-btn");
const fullscreenBtn = document.querySelector(".fullscreen-btn");
const miniPlayerBtn = document.querySelector(".mini-player-btn");
const muteBtn = document.querySelector(".mute-btn");
const volumeSlider = document.querySelector(".volume-slider");
const currentTimeEl = document.querySelector(".current-time");
const totalTimeEl = document.querySelector(".total-time");
const ccBtn = document.querySelector(".cc-btn");
const speedBtn = document.querySelector(".speed-btn");
const videoControlsContainer = document.querySelector(
  ".video-controls-container"
);
const previewImg = document.querySelector(".preview-img");
const thumbnailImg = document.querySelector(".thumbnail-img");
const timelineContainer = document.querySelector(".timeline-container");
const video = document.querySelector("video");
const videoContainer = document.querySelector(".video-container");

// Keyboard commands

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();
  if (tagName === "input" || e.shiftKey || e.ctrlKey) return;
  switch (e.key.toLowerCase()) {
    case "k":
    case " ":
      // prevent a user using keyboard from playing video when tabbed on a button
      if (tagName === "button") return;
      e.preventDefault();
      togglePlay();
      break;
    case "f":
      toggleFullscreenMode();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "i":
      toggleMiniPlayerMode();
      break;
    case "m":
      toggleMute();
      break;
    case "arrowup":
      if (document.activeElement === videoContainer) {
        e.preventDefault();
        increaseVolume();
      }
      break;
    case "arrowdown":
      if (document.activeElement === videoContainer) {
        e.preventDefault();
        decreaseVolume();
      }
      break;
    case "arrowleft":
    case "j":
      skip(-5);
      break;
    case "arrowright":
    case "l":
      skip(5);
      break;
    case "c":
      toggleCaptions();
      break;
    case "=":
      changePlaybackSpeed();
      break;
    default:
      break;
  }
});

// TIMELINE

timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

timelineContainer.addEventListener("touchmove", handleTimelineUpdate);
timelineContainer.addEventListener("touchstart", toggleScrubbing);
document.addEventListener("touchend", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("touchend", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

let isScrubbing = false;
let wasPaused;

function toggleScrubbing(e) {
  // This function is only called once, when the mouse is clicked down, and once when the mouse is let go.
  const percent = getPercent(e);

  isScrubbing = (e.buttons & 1) === 1;
  videoContainer.classList.toggle("scrubbing", isScrubbing);
  if (isScrubbing) {
    wasPaused = video.paused;
    video.pause();
  } else {
    video.currentTime = percent * video.duration;
    if (!wasPaused) video.play();
  }

  handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
  const percent = getPercent(e);

  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 10) + 1
  );
  const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`;
  previewImg.src = previewImgSrc;

  timelineContainer.style.setProperty("--preview-position", percent);

  if (isScrubbing) {
    //prevents highlighting anything on the page
    e.preventDefault();
    thumbnailImg.src = previewImgSrc;
    timelineContainer.style.setProperty("--progress-position", percent);
  }
}

function getPercent(e) {
  let x;
  const rect = timelineContainer.getBoundingClientRect();
  if (
    e.type === "touchstart" ||
    e.type === "touchend" ||
    e.type === "touchmove"
  ) {
    let touch = e.touches[0];
    x = touch.clientX;
  } else if (
    e.type === "mousedown" ||
    e.type === "mouseup" ||
    e.type === "mousemove"
  ) {
    x = e.x;
  }
  return Math.min(Math.max(0, x - rect.x), rect.width) / rect.width;
}

// PLAYBACK SPEED

speedBtn.addEventListener("click", changePlaybackSpeed);

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 2) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
}

// CAPTIONS

// set captions to off by default
const captions = video.textTracks[0];
captions.mode = "hidden";

ccBtn.addEventListener("click", toggleCaptions);

function toggleCaptions() {
  const isHidden = captions.mode === "hidden";
  captions.mode = isHidden ? "showing" : "hidden";
  videoContainer.classList.toggle("captions", isHidden);
}

// TIMECODE

video.addEventListener("loadeddata", () => {
  totalTimeEl.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration;
  timelineContainer.style.setProperty("--progress-position", percent);
});

const leadingZero = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});

function formatDuration(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZero.format(seconds)}`;
  } else {
    return `${hours}:${leadingZero.format(minutes)}:${leadingZero.format(
      seconds
    )}`;
  }
}

function skip(duration) {
  video.currentTime += duration;
}

// VOLUME

muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeLevel = "muted";
    volumeSlider.value = 0;
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }

  videoContainer.dataset.volumeLevel = volumeLevel;
});

function increaseVolume() {
  let volume = video.volume + 0.05;
  if (volume > 1) volume = 1;
  video.volume = volume;
}

function decreaseVolume() {
  let volume = video.volume - 0.05;
  if (volume < 0) volume = 0;
  video.volume = volume;
}

// VIEW MODES

theaterBtn.addEventListener("click", toggleTheaterMode);
fullscreenBtn.addEventListener("click", toggleFullscreenMode);
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode);

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater");
}

function toggleFullscreenMode() {
  // browser fullscreen api
  if (document.fullscreenElement == null) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function toggleMiniPlayerMode() {
  // browser picture in picture api
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("fullscreen", document.fullscreenElement);
  if (document.fullscreenElement) {
    videoContainer.addEventListener("mousemove", toggleControls);
  } else {
    videoContainer.removeEventListener("mousemove", toggleControls);
    //return to default style if user exits fullscreen without moving mouse
    videoControlsContainer.style.removeProperty("opacity");
  }
});

let debounce;
function toggleControls() {
  //remove style is user moves mouse in fullscreen (revealing contol bar)
  videoControlsContainer.style.removeProperty("opacity");
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    if (document.fullscreenElement) {
      videoControlsContainer.style.setProperty("opacity", "0");
    } else {
      //remove style if user exits fullscreen while moving the mouse
      videoControlsContainer.style.removeProperty("opacity");
    }
  }, 1500);
}

// add and remove mini-player class (which is used to know if we are or are not in mini-player mode)
video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player");
});

// PLAY/PAUSE

playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);

function togglePlay() {
  video.paused ? video.play() : video.pause();
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});
