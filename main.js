const hal = document.getElementById("hal");

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");

let isPlaying = false;
let currentFrame;

function start() {
  if (isPlaying) {
    currentFrame = requestAnimationFrame(loop);
  }
}

function loop(timestamp) {
  // move();
  // draw();
  analyze();
  if (isPlaying) {
    currentFrame = requestAnimationFrame(loop);
  } else {
    cancelAnimationFrame(currentFrame);
  }
}

function move() {
  console.log("moving");
}

function draw() {}

function range(from, to, multiplier) {
  const diff = to - from;
  return from + diff * multiplier;
}

function speak(magnitude) {
  hal.style.setProperty("--duration", "200ms");
  hal.style.setProperty(
    "--outer-yellow-pos",
    `${range(1, 20, magnitude * 0.5)}%`
  );
  hal.style.setProperty("--inner-red-pos", `${range(5, 40, magnitude * 0.7)}%`);
  hal.style.setProperty("--outer-red-pos", `${range(8, 49, magnitude)}%`);
  hal.style.setProperty("--inner-black-pos", `${range(30, 88, magnitude)}%`);
}

function silence() {
  hal.style.setProperty("--duration", "2s");
  setTimeout(() => {
    hal.style.setProperty("--outer-yellow-pos", `1%`);
    hal.style.setProperty("--inner-red-pos", `5%`);
    hal.style.setProperty("--outer-red-pos", `8%`);
    hal.style.setProperty("--inner-black-pos", `30%`);
  }, 0);
}

let count = 0;
document.addEventListener("click", async (e) => {
  if (!analyser) {
    await initAudio();
  }
  if (!isPlaying) {
    isPlaying = true;
    start();
  } else {
    isPlaying = false;
    cancelAnimationFrame(currentFrame);
    silence();
  }
});

document.addEventListener("keydown", (e) => {
  console.log(e);
  switch (e.code) {
    case "s": {
      console.log("down");
    }
  }
});

function starrySky() {
  const stars = Array.from({ length: 500 }, (_, i) => {
    const size = `${Math.random() * 3}px`;
    return `<span class="star" style="transform:translate(${
      Math.random() * 100
    }vw, ${Math.random() * 100}vh);width:${size};height:${size};"></span>`;
  });
  document.getElementById("sky").innerHTML = stars.join("");
}

starrySky();

let analyser;
let dataArray;
async function initAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.fftSize);
  } catch (err) {
    console.log(err);
  }
}

function analyze() {
  analyser.getByteTimeDomainData(dataArray);
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const value = (dataArray[i] - 128) / 128;
    sum += value * value;
  }
  const averageAmplitude = Math.sqrt(sum / dataArray.length);
  const amp = Math.min(1, averageAmplitude * 10);
  speak(amp);
}
