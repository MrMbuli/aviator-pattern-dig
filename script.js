let balance = 1000;
let bet = 10;
let multiplier = 1.0;
let crashPoint = 0;
let isRunning = false;
let startTime = 0;

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

// Generate a random crash point (1.1x to 10x)
function generateCrashPoint() {
  return (Math.random() * 8.9 + 1.1); // 1.1 to 10
}

// Start game
document.getElementById("play-btn").addEventListener("click", function () {
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

  crashPoint = generateCrashPoint();
  resultText.textContent = "";

  startTime = Date.now();
  isRunning = true;

  const interval = setInterval(() => {
    if (!isRunning) {
      clearInterval(interval);
      return;
    }

    multiplier += 0.02; // increase multiplier
    multiplierText.textContent = multiplier.toFixed(2) + "x";
    drawMultiplier();

    if (multiplier >= crashPoint) {
      // Crash
      multiplierText.textContent = crashPoint.toFixed(2) + "x";
      resultText.textContent = "CRASH! You lost.";
      crashSound.play();
      isRunning = false;
      clearInterval(interval);
    }
  }, 100);
});

// Cash out manually
document.getElementById("cashout-btn").addEventListener("click", function () {
  if (!isRunning) return;

  let payout = bet * multiplier;
  balance += payout;
  balanceText.textContent = balance.toFixed(2);
  resultText.textContent = `You cashed out! Won: $${payout.toFixed(2)}`;
  winSound.play();
  isRunning = false;
});

// Draw multiplier on canvas
function drawMultiplier() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00ffcc";
  ctx.font = "20px Arial";
  ctx.fillText(`Multiplier: ${multiplier.toFixed(2)}`, 10, 30);
}
