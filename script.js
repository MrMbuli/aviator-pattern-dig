let balance = 1000;
let bet = 10;
let multiplier = 1.0;
let crashTime = 0;
let startTime = 0;
let isRunning = false;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const balanceText = document.getElementById("balance");
const multiplierText = document.getElementById("multiplier");
const resultText = document.getElementById("result");

// Load sound effects
const crashSound = new Audio("assets/crash.mp3");
const winSound = new Audio("assets/win.mp3");

// Hash algorithms
const hashAlgorithms = {
  "SHA-256": "SHA-256",
  "SHA-1": "SHA-1",
  "MD5": "MD5"
};

// Selected hash algorithm
let selectedHash = "SHA-256";

// Display selected hash
document.getElementById("hash-select").addEventListener("change", function () {
  selectedHash = this.value;
  updateHashDisplay();
});

function updateHashDisplay() {
  document.getElementById("hash-display").textContent = `Selected Hash: ${selectedHash}`;
}

document.getElementById("bet").addEventListener("input", function () {
  bet = parseFloat(this.value);
});

document.getElementById("play-btn").addEventListener("click", function () {
  if (isRunning) return;

  const balanceText = document.getElementById("balance");
  const multiplierText = document.getElementById("multiplier");
  const resultText = document.getElementById("result");

  if (bet > balance) {
    alert("Insufficient balance!");
    return;
  }

  balance -= bet;
  balanceText.textContent = balance.toFixed(2);

  // Use the selected hash to seed the RNG
  const seed = hashData(new Date().toISOString(), selectedHash);
  const rng = new Random(seed);

  // Generate crash time using the RNG
  crashTime = rng.next() * 10 + 5; // 5 to 15 seconds
  startTime = Date.now();
  isRunning = true;
  resultText.textContent = "";
  multiplier = 1.0;
  multiplierText.textContent = multiplier.toFixed(2);

  drawMultiplier();

  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = elapsed / crashTime;
    multiplier = 1 + progress;
    multiplierText.textContent = multiplier.toFixed(2);

    drawMultiplier();

    if (progress >= 1) {
      clearInterval(interval);
      isRunning = false;

      if (progress === 1) {
        const payout = bet * multiplier;
        balance += payout;
        balanceText.textContent = balance.toFixed(2);
        resultText.textContent = `Crash! You won: $${payout.toFixed(2)}`;
        winSound.play();
      } else {
        resultText.textContent = "Crash! You lost.";
        crashSound.play();
      }
    }
  }, 100);
});

function drawMultiplier() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00ffcc";
  ctx.font = "20px Arial";
  ctx.fillText(`Multiplier: ${multiplier.toFixed(2)}`, 10, 30);
}

// Hash data using selected algorithm
function hashData(data, algorithm) {
  return window.crypto.subtle.digest(
    hashAlgorithms[algorithm],
    new TextEncoder().encode(data)
  ).then((hash) => {
    // Convert hash to hexadecimal
    const array = new Uint8Array(hash);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return hex;
  });
}

// Simple Random Number Generator
function Random(seed) {
  this.seed = seed;
  this.value = seed;
}

Random.prototype.next = function () {
  this.value = (this.value * 16807) % (2147483647);
  return this.value / 2147483647;
};

// WebSocket for multiplayer
const socket = new WebSocket("ws://localhost:8080");

socket.onmessage = function (event) {
  const data = JSON.parse(event.data);
  if (data.type === "crash") {
    const crashTime = data.crashTime;
    const multiplier = data.multiplier;
    const result = data.result;

    // Handle multiplayer crash
    resultText.textContent = result;
    if (result === "win") {
      const payout = bet * multiplier;
      balance += payout;
      balanceText.textContent = balance.toFixed(2);
      winSound.play();
    } else {
      resultText.textContent = "Crash! You lost.";
      crashSound.play();
    }
  }
};

socket.onopen = function () {
  console.log("Connected to WebSocket server");
};
