// Game state
let score = 0;
let combo = 0;
let lives = 3;
let gameActive = false;
let gameStarted = false;

// Game mode
let gameMode = null;
let currentPlayer = 1;
let player1Name = "Player 1";
let player2Name = "Player 2";
let player1Score = 0;
let player2Score = 0;

// Rhythm game
let notes = [];
let holdNotes = [];
let noteSpeed = 2; // pixels per frame
let spawnInterval = 2000; // ms between spawns
let lastSpawnTime = 0;
let difficulty = 1;
const hitZoneY = window.innerHeight - 120;
const perfectWindow = 50; // pixels
const goodWindow = 100; // pixels
const keys = ['a', 's', 'd', 'f'];
let activeKeys = {};
let isHoldingSpace = false;

// Leaderboard
let allTimeScores = JSON.parse(localStorage.getItem("sipaRhythmScores")) || [];

// Shop Data
let coins = parseInt(localStorage.getItem("sipaCoins")) || 0;
let inventory = JSON.parse(localStorage.getItem("sipaInventory")) || { sipa: ["sipa_classic"], player: ["player_default"], music: ["music_synthwave"], place: ["place_rooftop"] };
let equipped = JSON.parse(localStorage.getItem("sipaEquipped")) || { sipa: "sipa_classic", player: "player_default", music: "music_synthwave", place: "place_rooftop" };

const shopItems = [
  // SIPA SKINS
  { id: "sipa_classic", type: "sipa", name: "Classic Sipa", cost: 0, color: "#C0C0C0" },
  { id: "sipa_gold", type: "sipa", name: "Golden Sipa", cost: 100, color: "#FFD700" },
  { id: "sipa_fire", type: "sipa", name: "Fire Sipa", cost: 250, color: "#ff4444" },
  { id: "sipa_neon", type: "sipa", name: "Neon Sipa", cost: 400, color: "#00ff00" }, // New!
  { id: "sipa_void", type: "sipa", name: "Void Sipa", cost: 600, color: "#000000" }, // New!

  // PLAYER SKINS
  { id: "player_default", type: "player", name: "Blue Shirt", cost: 0, color: "#4facfe" },
  { id: "player_red", type: "player", name: "Red Shirt", cost: 150, color: "#ff4444" },
  { id: "player_ninja", type: "player", name: "Ninja Suit", cost: 300, color: "#1a1a1a" },
  { id: "player_gold", type: "player", name: "Golden Suit", cost: 500, color: "#FFD700" },
  { id: "player_white", type: "player", name: "White Suit", cost: 200, color: "#ffffff" },

  // MUSIC TRACKS
  { id: "music_synthwave", type: "music", name: "Synthwave Beat", cost: 0, file: null },
  { id: "music_rock", type: "music", name: "NEFFEX - Grateful", cost: 0, file: "grateful.mp3" },
  { id: "music_jazz", type: "music", name: "Jazz Fusion", cost: 1000, file: "night_time.mp3" },
  { id: "music_electronic", type: "music", name: "Electronic Drop", cost: 2000, file: "electronic.mp3" },

  // PLACES/ENVIRONMENTS
  { id: "place_rooftop", type: "place", name: "City Rooftop", cost: 0, theme: "rooftop" },
  { id: "place_beach", type: "place", name: "Beach Sunset", cost: 800, theme: "beach" },
  { id: "place_space", type: "place", name: "Space Station", cost: 1500, theme: "space" },
  { id: "place_mountain", type: "place", name: "Mountain Peak", cost: 2000, theme: "mountain" },
  { id: "place_grass", type: "place", name: "Grass Field", cost: 2200, theme: "grass" },
  { id: "place_neon", type: "place", name: "Neon Arena", cost: 2500, theme: "neon" }
];

// Environment Themes
const environmentThemes = {
  rooftop: {
    sky: "#240b36",
    floor: "#120520",
    grid: "#d900ff",
    fog: "#240b36",
    sun: "#ff7b00"
  },
  beach: {
    sky: "#ff6b6b",
    floor: "#f4e4c1",
    grid: "#ffd93d",
    fog: "#ff9a8b",
    sun: "#ff4757"
  },
  space: {
    sky: "#0a0e27",
    floor: "#1a1a2e",
    grid: "#00d4ff",
    fog: "#0a0e27",
    sun: "#ffffff"
  },
  mountain: {
    sky: "#87ceeb",
    floor: "#8b7355",
    grid: "#ffffff",
    fog: "#b0c4de",
    sun: "#ffd700"
  },
  grass: {
    sky: "#87CEEB",
    floor: "#4a7c2c",
    grid: "#90EE90",
    fog: "#87CEEB",
    sun: "#FFD700"
  },
  neon: {
    sky: "#000000",
    floor: "#0d0d0d",
    grid: "#ff00ff",
    fog: "#1a001a",
    sun: "#00ffff"
  }
};

// Background Palettes
const bgPalettes = [
  { sky: "#240b36", sun: "#ff7b00", grid: "#d900ff", fog: "#240b36" }, // 0: Synthwave (Purple)
  { sky: "#2c003e", sun: "#ff0000", grid: "#ff0000", fog: "#2c003e" }, // 1: Red Alert
  { sky: "#001f3f", sun: "#00ffff", grid: "#00ffff", fog: "#001f3f" }, // 2: Cyber Blue
  { sky: "#0f380f", sun: "#00ff00", grid: "#00ff00", fog: "#0f380f" }, // 3: Matrix Green
  { sky: "#000000", sun: "#ffffff", grid: "#ffffff", fog: "#000000" }  // 4: Void
];

// DOM elements
let scoreDisplay,
  livesDisplay,
  gameOverDisplay,
  restartBtn,
  spinnerDisplay,
  comboDisplay,
  timingFeedback;

// Start menu elements
let startMenu,
  singlePlayerBtn,
  multiplayerBtn,
  playerSetup,
  player1Input,
  player2Input,

  startGameBtn,
  viewLeaderboardBtn,
  menuLeaderboardModal,
  closeLeaderboardBtn,
  menuLeaderboardContent,

  tabSingle,
  tabMulti,
  shopBtn,
  shopModal,
  shopContent,
  coinDisplay,
  shopCoinDisplay,
  tabShopSipa,
  tabShopPlayer,
  tabShopMusic,
  tabShopPlaces,
  closeShopBtn;

let currentBgStage = 1;
// Game entities
let sipa;
let lanes = [];

// Player character parts
let player;
let playerRightLeg;
let playerRightFoot;
let playerLeftArm;
let playerRightArm;
let playerBody;
let playerHead;

// Initialize when scene loads
document.addEventListener("DOMContentLoaded", function () {
  const scene = document.querySelector("a-scene");
  if (scene.hasLoaded) {
    initGame();
  } else {
    scene.addEventListener("loaded", initGame);
  }
});

function initGame() {
  // Game UI elements
  scoreDisplay = document.getElementById("score");
  AudioManager.init(); // Init Audio Logic
  livesDisplay = document.getElementById("lives");
  gameOverDisplay = document.getElementById("gameOver");
  restartBtn = document.getElementById("restartBtn");
  leaderboardContent = document.getElementById("leaderboardContent");
  currentPlayerDisplay = document.getElementById("currentPlayer");
  comboDisplay = document.getElementById("comboDisplay");
  timingFeedback = document.getElementById("timingFeedback");

  // Start menu elements
  startMenu = document.getElementById("startMenu");
  singlePlayerBtn = document.getElementById("singlePlayerBtn");
  multiplayerBtn = document.getElementById("multiplayerBtn");
  playerSetup = document.getElementById("playerSetup");
  player1Input = document.getElementById("player1Name");
  player2Input = document.getElementById("player2Name");

  startGameBtn = document.getElementById("startGameBtn");
  viewLeaderboardBtn = document.getElementById("viewLeaderboardBtn");
  menuLeaderboardModal = document.getElementById("menuLeaderboardModal");
  closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
  menuLeaderboardContent = document.getElementById("menuLeaderboardContent");
  tabSingle = document.getElementById("tabSingle");
  tabMulti = document.getElementById("tabMulti");

  // Shop Elements
  shopBtn = document.getElementById("shopBtn");
  shopModal = document.getElementById("shopModal");
  shopContent = document.getElementById("shopContent");
  coinDisplay = document.getElementById("coinDisplay");
  shopCoinDisplay = document.getElementById("shopCoinDisplay");
  tabShopSipa = document.getElementById("tabShopSipa");
  tabShopPlayer = document.getElementById("tabShopPlayer");
  tabShopMusic = document.getElementById("tabShopMusic");
  tabShopPlaces = document.getElementById("tabShopPlaces");
  closeShopBtn = document.getElementById("closeShopBtn");

  // Game entities
  sipa = document.getElementById("sipa");
  lanes = document.querySelectorAll(".lane");

  // Player character parts
  player = document.getElementById("player");
  playerRightLeg = document.getElementById("playerRightLeg");
  playerRightFoot = document.getElementById("playerRightFoot");
  playerLeftArm = document.getElementById("playerLeftArm");
  playerRightArm = document.getElementById("playerRightArm");
  playerBody = document.getElementById("playerBody");
  playerHead = document.getElementById("playerHead");

  // Start menu event listeners
  singlePlayerBtn.addEventListener("click", () => selectMode("single"));
  multiplayerBtn.addEventListener("click", () => selectMode("multiplayer"));

  startGameBtn.addEventListener("click", startGame);
  viewLeaderboardBtn.addEventListener("click", openLeaderboard);
  closeLeaderboardBtn.addEventListener("click", closeLeaderboard);
  tabSingle.addEventListener("click", () => showScoreTab("single"));
  tabMulti.addEventListener("click", () => showScoreTab("multiplayer"));

  // Shop Listeners
  shopBtn.addEventListener("click", openShop);
  closeShopBtn.addEventListener("click", closeShop);
  tabShopSipa.addEventListener("click", () => renderShop("sipa"));
  tabShopPlayer.addEventListener("click", () => renderShop("player"));
  tabShopMusic.addEventListener("click", () => renderShop("music"));
  tabShopPlaces.addEventListener("click", () => renderShop("place"));

  // Game event listeners - use capture to intercept before A-Frame
  window.addEventListener("keydown", handleKeyDown, true);
  window.addEventListener("keyup", handleKeyUp, true);
  restartBtn.addEventListener("click", () => location.reload());

  // Initialize leaderboard & Shop
  updateLeaderboard();
  updateCoinDisplay();
  applySkins();
  updateBackground(1);

  // Load equipped music track
  const equippedMusic = shopItems.find(i => i.id === equipped.music);
  if (equippedMusic && typeof AudioManager !== 'undefined') {
    AudioManager.loadTrack(equippedMusic.file);
  }

  // Apply equipped environment
  const equippedPlace = shopItems.find(i => i.id === equipped.place);
  if (equippedPlace) {
    applyEnvironment(equippedPlace.theme);
  }

  // Disable VR mode completely to keep UI visible
  const scene = document.querySelector("a-scene");
  if (scene) {
    scene.addEventListener("enter-vr", (e) => {
      e.preventDefault();
      e.stopPropagation();
      scene.exitVR();
    });
  }

  setTimeout(() => gameLoop(), 500);
}

function handleKeyDown(event) {
  // Allow typing in input fields
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;

  const key = event.key.toLowerCase();

  // ALWAYS Prevent default behavior for game keys to stop VR/Fullscreen
  // This must run before gameActive check
  if (keys.includes(key)) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!gameActive) return;

  // Handle ASDF keys
  if (keys.includes(key) && !activeKeys[key]) {
    activeKeys[key] = true;
    const laneIndex = keys.indexOf(key);
    lanes[laneIndex].classList.add("active");
    checkNoteHit(key);
  }

}

function handleKeyUp(event) {
  // Allow typing in input fields
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;

  const key = event.key.toLowerCase();

  // ALWAYS Prevent default behavior for game keys
  if (keys.includes(key)) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!gameActive) return;

  // Release ASDF keys
  if (keys.includes(key)) {
    activeKeys[key] = false;
    const laneIndex = keys.indexOf(key);
    lanes[laneIndex].classList.remove("active");
  }

}

function checkNoteHit(key) {
  const laneIndex = keys.indexOf(key);
  let hitNote = null;
  let bestDistance = Infinity;

  // Find closest note in this lane
  notes.forEach(note => {
    if (note.lane === laneIndex) {
      const distance = Math.abs(note.y - hitZoneY);
      if (distance < bestDistance) {
        bestDistance = distance;
        hitNote = note;
      }
    }
  });

  if (hitNote && bestDistance < goodWindow) {
    // Check if it's a bomb
    if (hitNote.isBomb) {
      handleBombHit(hitNote);
    } else {
      // Hit!
      const isPerfect = bestDistance < perfectWindow;
      handleNoteHit(hitNote, isPerfect);
    }
  }
}

function handleNoteHit(note, isPerfect) {
  // Remove note
  note.element.remove();
  notes = notes.filter(n => n !== note);

  // Update score
  const points = isPerfect ? 10 : 5;
  score += points * (combo + 1);
  combo++;
  scoreDisplay.textContent = "Score: " + score;

  // Show feedback
  showTimingFeedback(isPerfect ? "PERFECT!" : "GOOD!");

  // Update combo display
  if (combo > 2) {
    comboDisplay.textContent = `🔥 COMBO x${combo} 🔥`;
    comboDisplay.classList.add("active");
  }

  // Audio
  AudioManager.playKick();
  if (isPerfect) {
    AudioManager.playPerfect();
    coins++;
    updateCoinDisplay();
    localStorage.setItem("sipaCoins", coins);
  }

  // Visuals - Particles
  const noteRect = note.element.getBoundingClientRect();
  const centerX = noteRect.left + noteRect.width / 2;
  const centerY = noteRect.top + noteRect.height / 2;
  const laneColors = ["#ff4444", "#4facfe", "#43e97b", "#ffd700"]; // Colors match lanes A S D F
  createExplosion(centerX, centerY, laneColors[note.lane]);

  // Kick Sipa and animate player
  kickSipa();
  animatePlayerKick();

  // Increase difficulty (adjust frequency based on music type)
  const isCustomMusic = equipped.music !== "music_synthwave";
  const difficultyThreshold = isCustomMusic ? 20 : 10; // Every 20 points for custom music

  if (score % difficultyThreshold === 0 && score > 0) {
    increaseDifficulty();
  }

  // Update background every 10,000 points
  const newBgStage = Math.floor(score / 10000) + 1;
  if (newBgStage > currentBgStage) {
    currentBgStage = newBgStage;
    updateBackground(currentBgStage);
  }
}

function handleBombHit(bomb) {
  // Remove bomb
  bomb.element.remove();
  notes = notes.filter(n => n !== bomb);

  // Explosion effect
  const bombRect = bomb.element.getBoundingClientRect();
  const centerX = bombRect.left + bombRect.width / 2;
  const centerY = bombRect.top + bombRect.height / 2;
  createExplosion(centerX, centerY, "#ff0000");

  // Play explosion sound
  if (typeof AudioManager !== 'undefined') AudioManager.playExplosion();

  // Lose life
  combo = 0;
  comboDisplay.classList.remove("active");
  lives--;
  const hearts = "❤️ ".repeat(lives) + "🖤 ".repeat(3 - lives);
  livesDisplay.textContent = hearts.trim();
  showTimingFeedback("💥 BOMB!");

  if (lives <= 0) {
    endGame();
  }
}

function animatePlayerKick() {
  if (!playerRightLeg || !playerRightFoot) return;

  // Kick animation - swing leg forward
  const originalLegRotation = "0 0 0";
  const originalFootPos = "0.15 0.6 0.1";

  // Swing leg back first
  playerRightLeg.setAttribute("rotation", "-30 0 0");
  playerRightFoot.setAttribute("position", "0.15 0.5 -0.1");

  setTimeout(() => {
    // Kick forward!
    playerRightLeg.setAttribute("rotation", "60 0 0");
    playerRightFoot.setAttribute("position", "0.15 0.8 0.5");

    // Arms swing
    if (playerLeftArm) playerLeftArm.setAttribute("rotation", "0 0 -30");
    if (playerRightArm) playerRightArm.setAttribute("rotation", "0 0 30");

    // Body leans back slightly
    if (playerBody) playerBody.setAttribute("rotation", "-10 0 0");
    if (playerHead) playerHead.setAttribute("rotation", "-10 0 0");
  }, 100);

  setTimeout(() => {
    // Return to normal
    playerRightLeg.setAttribute("rotation", originalLegRotation);
    playerRightFoot.setAttribute("position", originalFootPos);
    if (playerLeftArm) playerLeftArm.setAttribute("rotation", "0 0 20");
    if (playerRightArm) playerRightArm.setAttribute("rotation", "0 0 -20");
    if (playerBody) playerBody.setAttribute("rotation", "0 0 0");
    if (playerHead) playerHead.setAttribute("rotation", "0 0 0");
  }, 300);
}

function animatePlayerMiss() {
  if (!playerRightLeg || !playerBody) return;

  // Miss animation - awkward swing and stumble
  playerRightLeg.setAttribute("rotation", "-20 0 0");
  if (playerBody) playerBody.setAttribute("rotation", "0 0 -15");
  if (playerHead) playerHead.setAttribute("rotation", "0 0 -15");
  if (playerLeftArm) playerLeftArm.setAttribute("rotation", "0 0 45");
  if (playerRightArm) playerRightArm.setAttribute("rotation", "0 0 -45");

  setTimeout(() => {
    // Swing but miss
    playerRightLeg.setAttribute("rotation", "30 0 0");
    if (playerBody) playerBody.setAttribute("rotation", "0 0 15");
  }, 150);

  setTimeout(() => {
    // Return to normal disappointed
    playerRightLeg.setAttribute("rotation", "0 0 0");
    if (playerBody) playerBody.setAttribute("rotation", "0 0 0");
    if (playerHead) playerHead.setAttribute("rotation", "0 0 0");
    if (playerLeftArm) playerLeftArm.setAttribute("rotation", "0 0 20");
    if (playerRightArm) playerRightArm.setAttribute("rotation", "0 0 -20");
  }, 400);
}



function showTimingFeedback(text) {
  timingFeedback.textContent = text;
  timingFeedback.className = "";
  if (text.includes("PERFECT")) {
    timingFeedback.classList.add("perfect");
  } else if (text.includes("GOOD")) {
    timingFeedback.classList.add("good");
  } else {
    timingFeedback.classList.add("miss");
  }

  setTimeout(() => {
    timingFeedback.className = "";
  }, 500);
}

function kickSipa() {
  if (!sipa) return;

  // Animate Sipa kick
  const currentY = sipa.object3D.position.y;
  sipa.object3D.position.y = Math.min(currentY + 0.5, 4);

  // Scale animation
  sipa.setAttribute("scale", "3.6 3.6 3.6");
  setTimeout(() => sipa.setAttribute("scale", "3 3 3"), 100);
}

function loseLife(reason) {
  lives--;
  combo = 0;
  comboDisplay.classList.remove("active");

  // Update lives display
  const hearts = "❤️ ".repeat(lives) + "🖤 ".repeat(3 - lives);
  livesDisplay.textContent = hearts.trim();

  showTimingFeedback(reason || "MISS!");
  AudioManager.playMiss();

  // Animate player miss
  animatePlayerMiss();

  // Sipa falls a bit
  if (sipa) {
    const currentY = sipa.object3D.position.y;
    sipa.object3D.position.y = Math.max(currentY - 0.8, 0.5);
  }

  if (lives <= 0) {
    endGame();
  }
}

function spawnNote() {
  // Random lane
  const laneIndex = Math.floor(Math.random() * 4);
  const lane = lanes[laneIndex];

  // 10% chance to spawn a bomb
  const isBomb = Math.random() < 0.1;

  // Create note element
  const noteEl = document.createElement("div");
  if (isBomb) {
    noteEl.className = `note bomb`;
    noteEl.textContent = "💣";
  } else {
    noteEl.className = `note color-${keys[laneIndex]}`;
    noteEl.textContent = keys[laneIndex].toUpperCase();
  }
  noteEl.style.top = "0px";

  lane.appendChild(noteEl);

  notes.push({
    element: noteEl,
    lane: laneIndex,
    y: 0,
    speed: noteSpeed,
    isBomb: isBomb
  });
}

function updateNotes() {
  // Update regular notes
  notes.forEach(note => {
    note.y += note.speed;
    note.element.style.top = note.y + "px";

    // Check if missed (bombs passing safely is good!)
    if (note.y > hitZoneY + goodWindow) {
      if (!note.isBomb) {
        loseLife("Missed note!");
      }
      note.element.remove();
      notes = notes.filter(n => n !== note);
    }
  });

  // Spawn new notes
  const now = Date.now();
  if (now - lastSpawnTime > spawnInterval) {
    lastSpawnTime = now;
    spawnNote();
  }
}

function increaseDifficulty() {
  difficulty++;

  // Gentler difficulty for custom music tracks
  const isCustomMusic = equipped.music !== "music_synthwave";

  if (isCustomMusic) {
    noteSpeed += 0.15; // Slower increase
    spawnInterval = Math.max(1000, spawnInterval - 50); // Less frequent
  } else {
    noteSpeed += 0.3;
    spawnInterval = Math.max(800, spawnInterval - 100);
  }

  // Visual feedback
  showTimingFeedback("SPEED UP!");
  if (typeof AudioManager !== 'undefined') AudioManager.tempo += 5;
}

function gameLoop() {
  if (!gameStarted) {
    requestAnimationFrame(gameLoop);
    return;
  }

  if (!gameActive) {
    requestAnimationFrame(gameLoop);
    return;
  }

  updateNotes();

  // Slowly lower Sipa if no recent kicks
  if (sipa && sipa.object3D.position.y > 1) {
    sipa.object3D.position.y -= 0.005;
  }

  requestAnimationFrame(gameLoop);
}

function selectMode(mode) {
  gameMode = mode;

  singlePlayerBtn.classList.remove("selected");
  multiplayerBtn.classList.remove("selected");

  if (mode === "single") {
    singlePlayerBtn.classList.add("selected");
    playerSetup.classList.add("active");
    player2Input.parentElement.style.display = "none";
    startGameBtn.style.display = "block";
  } else {
    multiplayerBtn.classList.add("selected");
    playerSetup.classList.add("active");
    player2Input.parentElement.style.display = "flex";
    startGameBtn.style.display = "block";
  }
}

function startGame() {
  if (gameMode === "multiplayer") {
    player1Name = player1Input.value.trim() || "Player 1";
    player2Name = player2Input.value.trim() || "Player 2";
  } else {
    player1Name = player1Input.value.trim() || "Player 1";
  }

  AudioManager.tempo = 100;
  AudioManager.startMusic();
  currentBgStage = 1;
  updateBackground(1);
  startMenu.classList.add("hidden");
  gameStarted = true;
  gameActive = true;
  lastSpawnTime = Date.now();

  if (gameMode === "multiplayer") {
    currentPlayerDisplay.textContent = `${player1Name}'s Turn`;
    currentPlayerDisplay.style.display = "block";
  } else {
    currentPlayerDisplay.style.display = "none";
  }


  updateLeaderboard();
}

function endGame() {
  gameActive = false;
  AudioManager.stopMusic();

  if (gameMode === "single") {
    endSinglePlayerGame();
  } else {
    endMultiplayerTurn();
  }
}

function endSinglePlayerGame() {
  // Save Score with Mode
  const newScore = {
    name: player1Name,
    score: score,
    date: new Date().toLocaleDateString(),
    mode: "single"
  };

  // Update scores: Keep Top 10 Single + Top 10 Multi
  const otherScores = allTimeScores.filter(s => s.mode !== "single" && s.mode !== undefined);
  const singleScores = allTimeScores.filter(s => s.mode === "single" || s.mode === undefined);

  singleScores.push(newScore);
  singleScores.sort((a, b) => b.score - a.score);
  const topSingle = singleScores.slice(0, 10);

  allTimeScores = [...topSingle, ...otherScores];
  localStorage.setItem("sipaRhythmScores", JSON.stringify(allTimeScores));

  const isNewRecord = topSingle[0] === newScore;
  const buttonsHtml = `
    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
      <button class="mode-btn" onclick="playAgain()">Play Again</button>
      <button class="mode-btn" onclick="location.reload()" style="background: #e74c3c;">Menu</button>
    </div>
  `;

  if (isNewRecord) {
    gameOverDisplay.innerHTML = `
      🎉 NEW RECORD! 🎉<br>
      <span style="font-size: 32px;">Score: ${score}</span><br>
      ${buttonsHtml}
    `;
  } else {
    gameOverDisplay.innerHTML = `
      Game Over!<br>
      <span style="font-size: 32px;">Score: ${score}</span><br>
      <span style="font-size: 20px;">Best: ${allTimeScores[0]?.score || 0}</span><br>
      ${buttonsHtml}
    `;
  }

  gameOverDisplay.style.display = "block";
  updateLeaderboard();
}

function endMultiplayerTurn() {
  if (currentPlayer === 1) {
    player1Score = score;
    currentPlayer = 2;

    gameOverDisplay.innerHTML = `
      ${player1Name}: ${player1Score} points!<br>
      <span style="font-size: 24px;">${player2Name}'s Turn</span><br>
      <button id="restartBtn" onclick="startNextTurn()">Next Turn</button>
    `;
    gameOverDisplay.style.display = "block";
  } else {
    player2Score = score;

    let winnerText = "";
    if (player1Score > player2Score) {
      winnerText = `🏆 ${player1Name} WINS! 🏆`;
    } else if (player2Score > player1Score) {
      winnerText = `🏆 ${player2Name} WINS! 🏆`;
    } else {
      winnerText = "🤝 IT'S A TIE! 🤝";
    }

    const winnerName = player1Score >= player2Score ? player1Name : player2Name;
    const winnerScore = Math.max(player1Score, player2Score);

    // Save Multi Score
    const newScore = {
      name: winnerName,
      score: winnerScore,
      date: new Date().toLocaleDateString(),
      mode: "multiplayer"
    };

    const otherScores = allTimeScores.filter(s => s.mode !== "multiplayer");
    const multiScores = allTimeScores.filter(s => s.mode === "multiplayer");

    multiScores.push(newScore);
    multiScores.sort((a, b) => b.score - a.score);
    const topMulti = multiScores.slice(0, 10);

    allTimeScores = [...otherScores, ...topMulti];
    localStorage.setItem("sipaRhythmScores", JSON.stringify(allTimeScores));

    gameOverDisplay.innerHTML = `
      ${winnerText}<br>
      <div style="margin: 20px 0;">
        <div>${player1Name}: ${player1Score}</div>
        <div>${player2Name}: ${player2Score}</div>
      </div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="mode-btn" onclick="playAgain()">Play Again</button>
        <button class="mode-btn" onclick="location.reload()" style="background: #e74c3c;">Menu</button>
      </div>
    `;
    gameOverDisplay.style.display = "block";
  }

  updateLeaderboard();
}

// Make startNextTurn globally available
window.startNextTurn = function () {
  if (typeof AudioManager !== 'undefined') AudioManager.tempo = 100;
  currentBgStage = 1;
  updateBackground(1);
  // Reset game state
  score = 0;
  lives = 3;
  combo = 0;
  notes.forEach(note => note.element.remove());
  notes = [];
  gameActive = true;
  lastSpawnTime = Date.now();

  // Reset difficulty
  noteSpeed = 2;
  spawnInterval = 2000;
  difficulty = 1;

  // Update UI
  scoreDisplay.textContent = "Score: 0";
  livesDisplay.textContent = "❤️ ❤️ ❤️";
  comboDisplay.classList.remove("active");
  gameOverDisplay.style.display = "none";
  currentPlayerDisplay.textContent = `${player2Name}'s Turn`;

  updateLeaderboard();

  // Resume loop
  AudioManager.startMusic();
  gameStarted = true;
  requestAnimationFrame(gameLoop);
};

window.playAgain = function () {
  if (typeof AudioManager !== 'undefined') AudioManager.tempo = 100;
  currentBgStage = 1;
  updateBackground(1);
  if (gameMode === "multiplayer") {
    // Reset to player 1
    currentPlayer = 1;
    player1Score = 0;
    player2Score = 0;
    currentPlayerDisplay.textContent = `${player1Name}'s Turn`;
    currentPlayerDisplay.style.display = "block";
  }

  // Reset game state
  score = 0;
  lives = 3;
  combo = 0;
  notes.forEach(note => note.element.remove());
  notes = [];
  gameActive = true;
  lastSpawnTime = Date.now();

  // Reset difficulty
  noteSpeed = 2;
  spawnInterval = 2000;
  difficulty = 1;

  // Update UI
  scoreDisplay.textContent = "Score: 0";
  livesDisplay.textContent = "❤️ ❤️ ❤️";
  comboDisplay.classList.remove("active");
  gameOverDisplay.style.display = "none";

  updateLeaderboard();

  // Resume loop
  AudioManager.startMusic();
  gameStarted = true;
  requestAnimationFrame(gameLoop);
};

function updateLeaderboard() {
  if (gameMode === "single" || !gameStarted) {
    leaderboardContent.innerHTML = "";
    if (allTimeScores.length === 0) {
      leaderboardContent.innerHTML = '<div style="text-align: center; color: #888;">No scores yet!</div>';
    } else {
      allTimeScores.slice(0, 5).forEach((entry, index) => {
        const entryDiv = document.createElement("div");
        entryDiv.className = "score-entry";
        entryDiv.innerHTML = `
          <span>${index + 1}. ${entry.name}</span>
          <span>${entry.score}</span>
        `;
        leaderboardContent.appendChild(entryDiv);
      });
    }
  } else if (gameMode === "multiplayer") {
    leaderboardContent.innerHTML = `
      <div class="multiplayer-scores">
        <div class="player-score ${currentPlayer === 1 ? "active-turn" : ""}">
          <div class="name">${player1Name}</div>
          <div class="score">${player1Score}</div>
        </div>
        <div class="player-score ${currentPlayer === 2 ? "active-turn" : ""}">
          <div class="name">${player2Name}</div>
          <div class="score">${player2Score}</div>
        </div>
      </div>
    `;
  }
}

// Menu Leaderboard Functions
function openLeaderboard() {
  menuLeaderboardModal.classList.remove("hidden");
  showScoreTab("single"); // Default to single
}

function closeLeaderboard() {
  menuLeaderboardModal.classList.add("hidden");
}

function showScoreTab(mode) {
  // Update Tabs
  if (mode === "single") {
    tabSingle.classList.add("active");
    tabMulti.classList.remove("active");
  } else {
    tabSingle.classList.remove("active");
    tabMulti.classList.add("active");
  }

  // Filter Scores
  let filteredScores = [];
  if (mode === "single") {
    filteredScores = allTimeScores.filter(s => s.mode === "single" || s.mode === undefined);
  } else {
    filteredScores = allTimeScores.filter(s => s.mode === "multiplayer");
  }

  filteredScores.sort((a, b) => b.score - a.score);

  // Render
  menuLeaderboardContent.innerHTML = "";
  if (filteredScores.length === 0) {
    menuLeaderboardContent.innerHTML = '<div style="text-align: center; color: #888; font-style: italic; margin-top: 50px;">No scores yet for this mode!</div>';
  } else {
    filteredScores.forEach((entry, index) => {
      const entryDiv = document.createElement("div");
      entryDiv.className = "score-entry";
      entryDiv.style.justifyContent = "space-between";
      entryDiv.style.padding = "10px 20px";

      const rankColor = index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "white";

      entryDiv.innerHTML = `
        <span style="color: ${rankColor}; font-weight: bold; width: 30px;">${index + 1}.</span>
        <span style="flex: 1; text-align: left; margin-left: 20px;">${entry.name}</span>
        <span style="font-weight: bold; color: #ffd700;">${entry.score}</span>
        <span style="font-size: 14px; color: #aaa; margin-left: 20px;">${entry.date}</span>
      `;
      menuLeaderboardContent.appendChild(entryDiv);
    });
  }
}

function createExplosion(x, y, color) {
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.classList.add("particle");
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.background = color;

    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 100; // pixels per second equiv
    const tx = Math.cos(angle) * 100;
    const ty = Math.sin(angle) * 100;

    p.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: 600 + Math.random() * 400,
      easing: 'cubic-bezier(0, .9, .57, 1)'
    }).onfinish = () => p.remove();

    document.body.appendChild(p);
  }
}

// SHOP FUNCTIONS
function openShop() {
  shopModal.classList.remove("hidden");
  renderShop("sipa"); // Default tab
  updateCoinDisplay();
}

function closeShop() {
  shopModal.classList.add("hidden");
}

function updateCoinDisplay() {
  if (coinDisplay) coinDisplay.innerHTML = `🪙 ${coins}`;
  if (shopCoinDisplay) shopCoinDisplay.innerHTML = `🪙 ${coins}`;
}

function renderShop(category) {
  // Update Tabs
  tabShopSipa.classList.remove("active");
  tabShopPlayer.classList.remove("active");
  tabShopMusic.classList.remove("active");
  tabShopPlaces.classList.remove("active");

  if (category === "sipa") {
    tabShopSipa.classList.add("active");
  } else if (category === "player") {
    tabShopPlayer.classList.add("active");
  } else if (category === "music") {
    tabShopMusic.classList.add("active");
  } else if (category === "place") {
    tabShopPlaces.classList.add("active");
  }

  shopContent.innerHTML = "";

  // Ensure inventory has this category
  if (!inventory[category]) {
    inventory[category] = [];
  }

  const items = shopItems.filter(item => item.type === category);

  items.forEach(item => {
    const isOwned = inventory[category] && inventory[category].includes(item.id);
    const isEquipped = equipped[category] === item.id;

    const div = document.createElement("div");
    div.className = `shop-item ${isOwned ? "owned" : ""} ${isEquipped ? "equipped" : ""}`;

    let btnHtml = "";
    if (isEquipped) {
      btnHtml = `<button class="item-btn btn-equipped">Equipped</button>`;
    } else if (isOwned) {
      btnHtml = `<button class="item-btn btn-equip" onclick="equipItem('${item.id}', '${item.type}')">Equip</button>`;
    } else {
      btnHtml = `<button class="item-btn btn-buy" onclick="buyItem('${item.id}')">Buy ${item.cost}</button>`;
    }

    let previewHtml = "";
    if (category === "music") {
      previewHtml = `<div class="item-preview" style="background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-size: 32px;">🎵</div>`;
    } else if (category === "place") {
      previewHtml = `<div class="item-preview" style="background: linear-gradient(135deg, #43e97b, #38f9d7); display: flex; align-items: center; justify-content: center; font-size: 32px;">🌆</div>`;
    } else {
      previewHtml = `<div class="item-preview" style="background: ${item.color}"></div>`;
    }

    div.innerHTML = `
      ${previewHtml}
      <div class="item-name">${item.name}</div>
      ${btnHtml}
    `;

    shopContent.appendChild(div);
  });
}

window.buyItem = function (itemId) {
  const item = shopItems.find(i => i.id === itemId);
  if (!item) return;

  if (coins >= item.cost) {
    coins -= item.cost;
    inventory[item.type].push(item.id);
    localStorage.setItem("sipaCoins", coins);
    localStorage.setItem("sipaInventory", JSON.stringify(inventory));

    // Auto equip
    equipItem(item.id, item.type);

    // Play sound?
    AudioManager.playPerfect();

    renderShop(item.type);
    updateCoinDisplay();
  } else {
    // Fail sound
    AudioManager.playMiss();
    alert("Not enough coins! Play more to earn coins.");
  }
};

window.equipItem = function (itemId, type) {
  const item = shopItems.find(i => i.id === itemId);
  if (!item) return;

  if (inventory[type].includes(itemId)) {
    equipped[type] = itemId;
    localStorage.setItem("sipaEquipped", JSON.stringify(equipped));

    // Apply changes based on type
    if (type === "music") {
      // Load and switch to the new track
      if (typeof AudioManager !== 'undefined') {
        AudioManager.loadTrack(item.file);
      }
    } else if (type === "place") {
      // Apply environment theme
      applyEnvironment(item.theme);
    } else {
      applySkins();
    }

    renderShop(type);

    // Play sound?
    AudioManager.playKick();
  }
};

function applySkins() {
  // Apply Sipa Skin
  const sipaItem = shopItems.find(i => i.id === equipped.sipa);
  if (sipaItem && sipa) {
    // Sipa body is usually the first few children.
    // Specifically the cylinder and cone usually have the color.
    // Let's try finding the cylinder
    const parts = sipa.querySelectorAll("a-cylinder, a-cone, a-sphere, a-box");
    parts.forEach(part => {
      // Only change parts that had the original grey color or similar?
      // Or just change mostly everything except invisible hit box?
      if (part.getAttribute("opacity") !== "0") {
        part.setAttribute("color", sipaItem.color);
      }
    });
  }

  // Apply Player Skin
  const playerItem = shopItems.find(i => i.id === equipped.player);
  if (playerItem) {
    if (playerBody) playerBody.setAttribute("color", playerItem.color);
    if (playerLeftArm) playerLeftArm.setAttribute("color", playerItem.color);
    if (playerRightArm) playerRightArm.setAttribute("color", playerItem.color);
  }
}

function applyEnvironment(themeId) {
  const theme = environmentThemes[themeId];
  if (!theme) return;

  const sky = document.getElementById("sky");
  const sun = document.getElementById("sun");
  const grid = document.getElementById("grid");
  const floor = document.getElementById("floor");
  const scene = document.querySelector("a-scene");

  if (sky) sky.setAttribute("color", theme.sky);
  if (sun) {
    sun.setAttribute("color", theme.sun);
    sun.setAttribute("material", "emissive", theme.sun);
  }
  if (grid) grid.setAttribute("color", theme.grid);
  if (floor) floor.setAttribute("color", theme.floor);
  if (scene) scene.setAttribute("fog", "color", theme.fog);
}

function updateBackground(level) {
  const palette = bgPalettes[(level - 1) % bgPalettes.length];

  const sky = document.getElementById("sky");
  const sun = document.getElementById("sun");
  const grid = document.getElementById("grid");
  const scene = document.querySelector("a-scene");

  if (sky) sky.setAttribute("color", palette.sky);
  if (sun) {
    sun.setAttribute("color", palette.sun);
    sun.setAttribute("material", "emissive", palette.sun);
  }
  if (grid) grid.setAttribute("color", palette.grid);
  if (scene) scene.setAttribute("fog", "color", palette.fog);
}
