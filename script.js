let balance = 1000;
let bet = 10;
let multiplier = 1.0;
let crashPoint = 0;
let isRunning = false;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const balanceText = document.getElementById("balance");
const multiplierText = document.getElementById("multiplier");
const resultText = document.getElementById("result");

const crashSound = new Audio("assets/crash.mp3");
const winSound = new Audio("assets/win.mp3");

// Update bet safely
document.getElementById("bet").addEventListener("input", function () {
  let value = parseFloat(this.value);
  bet = isNaN(value) ? 0 : value;
});

// Hash algorithms
const hashAlgorithms = {
  "SHA-256": "SHA-256",
  "SHA-1": "SHA-1",
  "MD5": "MD5"
};
let selectedHash = "SHA-256";

// Display hash selection
document.getElementById("hash-select").addEventListener("change", function () {
  selectedHash = this.value;
  document.getElementById("hash-display").textContent = `Selected Hash: ${selectedHash}`;
});

// Draw multiplier on canvas
function drawMultiplier() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00ffcc";
  ctx.font = "20px Arial";
  ctx.fillText(`Multiplier: ${multiplier.toFixed(2)}`, 10, 30);
}

// Hash function (async)
async function hashData(data, algorithm) {
  const hashBuffer = await crypto.subtle.digest(hashAlgorithms[algorithm], new TextEncoder().encode(data));
  const array = Array.from(new Uint8Array(hashBuffer));
  return array.map(b => b.toString(16).padStart(2, '0')).join('');
}

// RNG class using hash seed
function RNG(seedHex) {
  let seed = parseInt(seedHex.substring(0, 8), 16);
  this.value = seed;
}

RNG.prototype.next = function () {
  this.value = (this.value * 16807) % 2147483647;
  return this.value / 2147483647;
};

// Start game
document.getElementById("play-btn").addEventListener("click", async function () {
  if (isRunning) return;

  if (bet <= 0) {
    alert("Enter a valid bet");
    return;
  }
  if (bet > balance) {
    alert("Insufficient balance!");
    return;
  }

  balance -= bet;
  balanceText.textContent = balance.toFixed(2);

  multiplier = 1.0;
  multiplierText.textContent = multiplier.toFixed(2) + "x";
  resultText.textContent = "";

  // Get hash seed
  const seedHex = await hashData(new Date().toISOString(), selectedHash);
  const rng = new RNG(seedHex);

  // Generate crash point 1.1x – 10x
  crashPoint = rng.next() * 8.9 + 1.1;
  isRunning = true;

  const interval = setInterval(() => {
    if (!isRunning) { clearInterval(interval); return; }

    multiplier += 0.02;
    multiplierText.textContent = multiplier.toFixed(2);
    drawMultiplier();

    if (multiplier >= crashPoint) {
      multiplierText.textContent = crashPoint.toFixed(2);
      resultText.textContent = "CRASH! You lost.";
      crashSound.play();
      isRunning = false;
      clearInterval(interval);
    }
  }, 100);
});

// Cashout manually
document.getElementById("cashout-btn").addEventListener("click", function () {
  if (!isRunning) return;

  const payout = bet * multiplier;
  balance += payout;
  balanceText.textContent = balance.toFixed(2);
  resultText.textContent = `You cashed out! Won: $${payout.toFixed(2)}`;
  winSound.play();
  isRunning = false;
});
