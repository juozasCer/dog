// Constants
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
    block.style.backgroundSize = 'cover'; // Ensure the image covers the area
    block.style.backgroundRepeat = 'no-repeat'; // Prevent repeating the image
    block.style.backgroundPosition = 'center'; // Center the image

    // Position the block at a random horizontal position within the game area
    block.style.left = `${Math.random() * (gameArea.clientWidth - size)}px`;

    // Add the block to the game area
    gameArea.appendChild(block);
}

// Function to update the position of falling blocks and check for collisions
function updateFallingBlocks() {
    const blocks = document.querySelectorAll('.falling-block');

    blocks.forEach(block => {
        const blockTop = parseFloat(block.style.top);
        block.style.top = `${blockTop + 5}px`; // Move the block down by 5px

        // Check if the block has hit the bottom of the game area
        if (blockTop + 30 > gameArea.clientHeight) {
            gameOver(); // End the game if a block reaches the bottom
        }

        // Check for collision with the player
        const blockLeft = parseFloat(block.style.left);
        const playerLeft = parseFloat(player.style.left);

        if (
            blockTop + 30 >= gameArea.clientHeight - 70 && // Player block height + player height margin
            blockLeft < playerLeft + 50 && // Player block width
            blockLeft + 30 > playerLeft // Falling block width
        ) {
            // Increment the score
            score += 10; // You can adjust the points per block
            scoreDisplay.textContent = `Score: ${score}`; // Update score display

            // Remove the caught block
            block.remove();
        }
    });
}

// Function to handle the game loop
function gameLoop() {
    if (!isGameOver) {
        updateFallingBlocks();
        if (Math.random() < 0.05) { // Chance to create a new block each loop iteration
            createFallingBlock();
        }
    }
}

// Function to end the game
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
  
    // Show the Game Over text
    gameOverText.style.display = 'block';
  
    // Remove all falling blocks
    document.querySelectorAll('.falling-block').forEach(block => block.remove());
  
    // Hide Game Over text after 2 seconds and show the start button
    setTimeout(() => {
      gameOverText.style.display = 'none';
      startButton.style.display = 'block';
      
      // Submit the score with the player's name
      submitScore(playerName, score);
    }, 2000);
}

// Function to move the player based on mouse movement
function movePlayerWithMouse(event) {
    const gameAreaRect = gameArea.getBoundingClientRect(); // Get the bounding box of the game area
    const mouseX = event.clientX - gameAreaRect.left; // Calculate mouse X within the game area

    // Calculate the new player position to center it with the mouse
    playerPosition = mouseX - (player.clientWidth / 2);

    // Ensure the player stays within the game area boundaries
    playerPosition = Math.max(0, Math.min(gameArea.clientWidth - player.clientWidth, playerPosition));

    // Update the player position
    player.style.left = `${playerPosition}px`;
}

// Attach event listener for mouse movement within the game area
gameArea.addEventListener('mousemove', movePlayerWithMouse);

// Attach event listener to the start button
startButton.addEventListener('click', startGame);

// Attach event listener to the set name button
setNameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        nameInputSection.style.display = 'none'; // Hide the name input section after setting the name
        startButton.style.display = 'block'; // Show the start button
        fetchLeaderboard(); // Fetch leaderboard when name is set
    } else {
        alert('Please enter a valid name');
    }
});

// Function to adjust background scroll speed
function adjustBackgroundScrollSpeed(speed) {
    const gameArea = document.getElementById('gameArea');
    gameArea.style.animationDuration = `${speed}s`;
}

// Example of adjusting speed (optional)
adjustBackgroundScrollSpeed(10); // 10 seconds for a full loop

// Replace with your actual backend URL
const API_URL = 'https://dog-blush-six.vercel.app';

async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const tableBody = document.querySelector('#leaderboard tbody');
        tableBody.innerHTML = ''; // Clear existing content

        data.forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td> <!-- Rank -->
                <td>${player.name}</td> <!-- Name -->
                <td>${player.score}</td> <!-- Score -->
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function submitScore(name, score) {
    try {
        const response = await fetch(`${API_URL}/leaderboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, score })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Score submitted:', data);
        fetchLeaderboard(); // Refresh leaderboard after submitting the score
    } catch (error) {
        console.error('Error:', error);
    }
}

// Fetch leaderboard data when the page loads
window.addEventListener('load', fetchLeaderboard);

