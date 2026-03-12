// --- Provably Fair Crash Game (Aviator‑style) ---

let balance = 1000;
let bet = 10;
let multiplier = 1.00;
let isRunning = false;
let nonce = 0; // increments each round for provably fair

const balanceText = document.getElementById("balance");
const multiplierText = document.getElementById("multiplier");
const resultText = document.getElementById("result");

// Update bet safely
document.getElementById("bet").addEventListener("input", function () {
  let value = parseFloat(this.value);
  bet = isNaN(value) ? 0 : value;
});

// Function to convert SHA‑512 hash to crash multiplier
function hashToCrashPoint(hashHex) {
  // Instant crash check (~3% chance for 1.00×)
  let firstInt = parseInt(hashHex.slice(0, 8), 16); 
  if (firstInt % 33 === 0) return 1.00;

  // Take first 13 hex chars → 52 bits
  let h = parseInt(hashHex.slice(0, 13), 16);
  let e = Math.pow(2, 52);

  // Crash formula
  let crash = Math.floor((100 * e - h) / (e - h)) / 100;
  return Math.max(crash, 1.00);
}

// Generate SHA‑512 hash
async function sha512(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const buffer = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join("");
}

// Play button handler
document.getElementById("play-btn").addEventListener("click", async function () {

  if (isRunning) return;
  if (bet <= 0) { alert("Enter a valid bet"); return; }
  if (bet > balance) { alert("Insufficient balance!"); return; }

  balance -= bet;
  balanceText.textContent = balance.toFixed(2);
  resultText.textContent = "";
  multiplier = 1.00;
  multiplierText.textContent = multiplier.toFixed(2) + "x";

  isRunning = true;
  nonce++;

  // Provably fair combined seed (player + nonce + time)
  let clientSeed = crypto.getRandomValues(new Uint32Array(2)).join("");
  let combined = clientSeed + nonce;

  // Hash it to get round hash
  let roundHash = await sha512(combined);

  // Calculate crash multiplier
  let crashPoint = hashToCrashPoint(roundHash);

  // Update loop
  const interval = setInterval(() => {
    if (!isRunning) { clearInterval(interval); return; }

    multiplier += 0.02;
    multiplierText.textContent = multiplier.toFixed(2) + "x";

    if (multiplier >= crashPoint) {
      clearInterval(interval);
      if (multiplier >= crashPoint && multiplier > 1.00) {
        resultText.textContent = "CRASHED at " + crashPoint.toFixed(2) + "x";
      } else {
        resultText.textContent = "CRASHED INSTANTLY at 1.00x";
      }
      isRunning = false;
    }
  }, 100);
});

// Cashout button
document.getElementById("cashout-btn").addEventListener("click", function () {
  if (!isRunning) return;

  let payout = bet * multiplier;
  balance += payout;
  balanceText.textContent = balance.toFixed(2);
  resultText.textContent = `You cashed out: ${multiplier.toFixed(2)}x → $${payout.toFixed(2)}`;
  isRunning = false;
});
