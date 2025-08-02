const user = document.getElementById('P1');
const com = document.getElementById('P2');
const nos1 = document.getElementById('NOS1');

// Progress bars
const p1Progress = document.getElementById('p1-progress');
const comProgress = document.getElementById('com-progress');

// Car selection from local storage
const selectedCar = localStorage.getItem('selectedCar') || 'mclaren-removebg-preview.png';
user.src = 'assets/cars/' + selectedCar;

// Initial positions
let userPosition = 100;
let comPosition = 100;
let userMoveDistance = 24;
const doubleSpeedDistance = 69;
const finishLine = 31000;

// Sounds
const accelerationSound = new Audio('assets/cars_sound/soundeffect.mp3');
accelerationSound.loop = true;

const comSound = new Audio('assets/cars_sound/soundeffect.mp3');
comSound.loop = true;
comSound.volume = 1;

// Key states
const keysPressed = { d: false, '2': false };

// Game state
let countdownRunning = true;

// Get computer speed based on difficulty
function getComputerSpeed(difficulty) {
  switch (difficulty) {
    case 'easy': return userMoveDistance - 2;
    case 'medium': return userMoveDistance + Math.random() * 2;
    case 'hard': return userMoveDistance + 3 + Math.random() * 2;
    case 'impossible': return userMoveDistance + 6 + Math.random() * 3;
    default: return userMoveDistance + Math.random() * 2;
  }
}

// Update progress bar widths
function updateProgressBars() {
  const p1Percent = Math.min((userPosition / finishLine) * 100, 100);
  const comPercent = Math.min((comPosition / finishLine) * 100, 100);
  p1Progress.style.width = `${p1Percent}%`;
  comProgress.style.width = `${comPercent}%`;
}

// Move user car
function moveUser() {
  if (!countdownRunning) {
    userPosition += keysPressed['2'] ? doubleSpeedDistance : userMoveDistance;

    // Show NOS flame if both keys are pressed
    if (keysPressed.d && keysPressed['2']) {
      nos1.style.display = 'block';
      nos1.style.left = (userPosition - 40) + 'px';
    } else {
      nos1.style.display = 'none';
    }

    if (userPosition >= finishLine) {
      endRace('YOU WIN', 'green');
    } else {
      user.style.left = userPosition + 'px';
      updateScrollPosition(userPosition, false);
    }

    updateProgressBars();
  }
}

// Move computer car
function moveCom() {
  if (!countdownRunning) {
    comPosition += computerSpeed;
    playComSound();

    // Adjust COM sound volume based on distance
    const volumeAdjust = comPosition > userPosition + 200 ? -0.01 : 0.01;
    comSound.volume = Math.min(1, Math.max(0.05, comSound.volume + volumeAdjust));

    if (comPosition >= finishLine) {
      endRace('YOU LOSE', 'red');
    } else {
      com.style.left = comPosition + 'px';
      updateScrollPosition(userPosition, false);
    }

    updateProgressBars();
  }
}

// Scroll camera to follow user car
function updateScrollPosition(carPosition, smooth) {
  window.scrollTo({
    left: carPosition - (window.innerWidth / 2) + 100,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

// Overlay result text (Win/Lose)
function showOverlayText(text, color) {
  const messageDiv = document.createElement('div');
  messageDiv.innerText = text;
  Object.assign(messageDiv.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '200px',
    color,
    textShadow: '2px 3px 10px black',
    fontWeight: 'bold',
    zIndex: '9999',
    pointerEvents: 'none'
  });
  document.body.appendChild(messageDiv);
  return messageDiv;
}

// End race
function endRace(message, color) {
  stopSound();
  showOverlayText(message, color);
  cancelAnimationFrame(gameLoopHandle);
  clearTimeout(computerTimeoutHandle);
}

// Sound functions
function playSound() {
  if (accelerationSound.paused) accelerationSound.play();
}

function playComSound() {
  if (comSound.paused) comSound.play();
}

function stopSound() {
  accelerationSound.pause();
  accelerationSound.currentTime = 0;
  comSound.pause();
  comSound.currentTime = 0;
}

// Handle key events
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'd') keysPressed.d = true;
  if (event.key === '2') keysPressed['2'] = true;
});

document.addEventListener('keyup', (event) => {
  if (event.key.toLowerCase() === 'd') {
    keysPressed.d = false;
    updateScrollPosition(userPosition, true);
  }
  if (event.key === '2') keysPressed['2'] = false;

  // Hide NOS if either key is released
  if (!keysPressed.d || !keysPressed['2']) nos1.style.display = 'none';
});

// Game loop
let gameLoopHandle;
function gameLoop() {
  if (keysPressed.d && !countdownRunning) {
    moveUser();
    playSound();
  }

  if (!keysPressed.d && !keysPressed['2']) stopSound();

  gameLoopHandle = requestAnimationFrame(gameLoop);
}

// Computer movement loop
let computerTimeoutHandle;
function computerCarMovement() {
  if (!countdownRunning) moveCom();
  computerTimeoutHandle = setTimeout(computerCarMovement, 0.1);
}

// Countdown
function startCountdown() {
  const countdownDiv = showOverlayText("Get Ready!", 'white');
  countdownDiv.style.fontSize = '150px';

  let countdown = 3;
  const countdownInterval = setInterval(() => {
    if (countdown > 0) {
      countdownDiv.innerText = countdown;
      countdown--;
    } else {
      clearInterval(countdownInterval);
      countdownDiv.innerText = "Go!";
      countdownDiv.style.color = 'green';
      setTimeout(() => {
        document.body.removeChild(countdownDiv);
        countdownRunning = false;
      }, 1000);
    }
  }, 1000);
}

// On page load
window.onload = function () {
  userPosition = 100;
  comPosition = 100;
  user.style.left = userPosition + 'px';
  com.style.left = comPosition + 'px';

  const difficultyDropdown = document.getElementById('difficulty');
  let selected = 'medium';

  if (difficultyDropdown) {
    const saved = localStorage.getItem('difficulty');
    if (saved) {
      difficultyDropdown.value = saved;
      selected = saved;
    } else {
      selected = difficultyDropdown.value;
    }

    difficultyDropdown.addEventListener('change', () => {
      localStorage.setItem('difficulty', difficultyDropdown.value);
      location.reload();
    });
  }

  computerSpeed = getComputerSpeed(selected);
  startCountdown();
  gameLoop();
  computerCarMovement();
};
