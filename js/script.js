const API_URL = 'https://dog-blush-six.vercel.app'; // Your live server URL

// Function to fetch the leaderboard data
async function fetchLeaderboard() {
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
    const data = await response.json();
    console.log('Leaderboard Data:', data); // Log data for debugging

    // Update leaderboard table
    const tableBody = document.querySelector('#leaderboard tbody');
    tableBody.innerHTML = ''; // Clear existing content

    data.forEach((player, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.score}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Function to submit the score to the server
function submitScore(name, score) {
  fetch(`${API_URL}/leaderboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, score })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Score submitted:', data);
    fetchLeaderboard(); // Fetch leaderboard after submitting the score
  })
  .catch(error => console.error('Error:', error));
}

// Game logic
const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const startButton = document.getElementById('startButton');
const gameOverText = document.getElementById('gameOverText');
const scoreDisplay = document.getElementById('score'); // Score display element
const nameInputSection = document.getElementById('nameInputSection');
const playerNameInput = document.getElementById('playerName');
const setNameButton = document.getElementById('setNameButton');
const leaderboardTable = document.querySelector('#leaderboard tbody');

let gameInterval;
let isGameOver = false;
let score = 0; // Initialize score
let playerName = ''; // Player name variable

// Initial player position
let playerPosition = gameArea.clientWidth / 2 - player.clientWidth / 2;
player.style.left = `${playerPosition}px`;

// Function to start the game
function startGame() {
  // Hide the start button and Game Over text
  startButton.style.display = 'none';
  gameOverText.style.display = 'none';

  // Reset game state
  isGameOver = false;
  score = 0; // Reset score
  scoreDisplay.textContent = `Score: ${score}`; // Update score display
  clearInterval(gameInterval);
  playerPosition = gameArea.clientWidth / 2 - player.clientWidth / 2;
  player.style.left = `${playerPosition}px`;

  gameInterval = setInterval(gameLoop, 50); // Run game loop every 50ms
}

// Function to create a falling block with random size
function createFallingBlock() {
  const block = document.createElement('div');
  block.classList.add('falling-block');
  
  // Define min and max size for the blocks
  const minSize = 20; // Minimum size in pixels
  const maxSize = 50; // Maximum size in pixels

  // Generate a random size within the range
  const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  
  block.style.width = `${size}px`;
  block.style.height = `${size}px`;
  block.style.position = 'absolute';
  block.style.top = '0px';

  // Set a random background image from 1.png to 4.png
  const imageIndex = Math.floor(Math.random() * 4) + 1; // Random number between 1 and 4
  block.style.backgroundImage = `url('/images/${imageIndex}.png')`;
  block.style.backgroundSize = 'cover'; // Ensure image covers the block
  
  gameArea.appendChild(block);
  
  // Animate block falling down
  let blockPosition = 0;
  const blockSpeed = 2; // Speed at which the block falls
  function fall() {
    if (blockPosition > gameArea.clientHeight) {
      block.remove();
      if (!isGameOver) {
        // Check for collision with player
        if (checkCollision(block)) {
          endGame();
        }
      }
    } else {
      blockPosition += blockSpeed;
      block.style.top = `${blockPosition}px`;
      requestAnimationFrame(fall);
    }
  }
  fall();
}

// Function to check if block collides with the player
function checkCollision(block) {
  const blockRect = block.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  return !(blockRect.right < playerRect.left ||
           blockRect.left > playerRect.right ||
           blockRect.bottom < playerRect.top ||
           blockRect.top > playerRect.bottom);
}

// Game loop
function gameLoop() {
  if (Math.random() < 0.05) { // Adjust probability for block creation
    createFallingBlock();
  }
}

// Function to end the game
function endGame() {
  clearInterval(gameInterval);
  isGameOver = true;
  gameOverText.style.display = 'block';

  // Show start button to restart the game
  startButton.style.display = 'block';

  // Prompt player to submit score
  if (playerName) {
    submitScore(playerName, score);
  }
}

// Event listener for the start button
startButton.addEventListener('click', startGame);

// Event listener for name input
setNameButton.addEventListener('click', () => {
  playerName = playerNameInput.value.trim();
  if (playerName) {
    nameInputSection.style.display = 'none'; // Hide input section
    fetchLeaderboard(); // Fetch leaderboard on name set
  } else {
    alert('Please enter your name.');
  }
});

// Function to copy contact address
function copyContactAddress() {
  const fullText = document.getElementById('contactAddress').textContent;
  const spaceIndex = fullText.indexOf(' ');
  const textToCopy = spaceIndex !== -1 ? fullText.substring(spaceIndex + 1) : fullText;

  navigator.clipboard.writeText(textToCopy).then(function () {
    alert('Contact address copied to clipboard!');
  }, function (err) {
    console.error('Failed to copy text: ', err);
  });
}
