// Constants
const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const startButton = document.getElementById('startButton');
const gameOverText = document.getElementById('gameOverText');
const scoreDisplay = document.getElementById('score');
const nameInputSection = document.getElementById('nameInputSection');
const playerNameInput = document.getElementById('playerName');
const setNameButton = document.getElementById('setNameButton');
const leaderboardTable = document.querySelector('#leaderboard tbody');

let gameInterval;
let isGameOver = false;
let score = 0;
let playerName = '';

// Initial player position
let playerPosition = gameArea.clientWidth / 2 - player.clientWidth / 2;
player.style.left = `${playerPosition}px`;

// Function to start the game
function startGame() {
    startButton.style.display = 'none';
    gameOverText.style.display = 'none';

    isGameOver = false;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    clearInterval(gameInterval);
    playerPosition = gameArea.clientWidth / 2 - player.clientWidth / 2;
    player.style.left = `${playerPosition}px`;

    gameInterval = setInterval(gameLoop, 50);
}

// Function to create a falling block with random size
function createFallingBlock() {
    const block = document.createElement('div');
    block.classList.add('falling-block');

    const minSize = 20;
    const maxSize = 50;
    const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

    block.style.width = `${size}px`;
    block.style.height = `${size}px`;
    block.style.position = 'absolute';
    block.style.top = '0px';

    const imageIndex = Math.floor(Math.random() * 4) + 1;
    block.style.backgroundImage = `url('/images/${imageIndex}.png')`;
    block.style.backgroundSize = 'cover';
    block.style.backgroundRepeat = 'no-repeat';
    block.style.backgroundPosition = 'center';

    block.style.left = `${Math.random() * (gameArea.clientWidth - size)}px`;
    gameArea.appendChild(block);
}

// Function to update the position of falling blocks and check for collisions
function updateFallingBlocks() {
    const blocks = document.querySelectorAll('.falling-block');

    blocks.forEach(block => {
        const blockTop = parseFloat(block.style.top);
        block.style.top = `${blockTop + 5}px`;

        if (blockTop + 30 > gameArea.clientHeight) {
            gameOver();
        }

        const blockLeft = parseFloat(block.style.left);
        const playerLeft = parseFloat(player.style.left);

        if (
            blockTop + 30 >= gameArea.clientHeight - 70 &&
            blockLeft < playerLeft + player.clientWidth &&
            blockLeft + parseFloat(block.style.width) > playerLeft
        ) {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            block.remove();
        }
    });
}

// Function to handle the game loop
function gameLoop() {
    if (!isGameOver) {
        updateFallingBlocks();
        if (Math.random() < 0.05) {
            createFallingBlock();
        }
    }
}

// Function to end the game
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);

    gameOverText.style.display = 'block';

    document.querySelectorAll('.falling-block').forEach(block => block.remove());

    setTimeout(() => {
        gameOverText.style.display = 'none';
        startButton.style.display = 'block';
        submitScore(playerName, score);
    }, 2000);
}

// Function to move the player based on mouse movement
function movePlayerWithMouse(event) {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const mouseX = event.clientX - gameAreaRect.left;
    playerPosition = mouseX - (player.clientWidth / 2);
    playerPosition = Math.max(0, Math.min(gameArea.clientWidth - player.clientWidth, playerPosition));
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
        nameInputSection.style.display = 'none';
        startButton.style.display = 'block';
        fetchLeaderboard();
    } else {
        alert('Please enter a valid name');
    }
});

// Function to submit the score to the server
function submitScore(name, score) {
    fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, score })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Score submitted:', data);
        fetchLeaderboard();
    })
    .catch(error => console.error('Error submitting score:', error));
}

// Function to fetch the leaderboard data and update the UI
function fetchLeaderboard() {
    fetch('/api/leaderboard')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            leaderboardTable.innerHTML = ''; // Clear existing entries

            if (data && data.length > 0) {
                data.forEach((player, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${player.name}</td>
                        <td>${player.score}</td>
                    `;
                    leaderboardTable.appendChild(row);
                });
            }
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
}

// Fetch leaderboard data when the page loads
window.addEventListener('load', fetchLeaderboard);
