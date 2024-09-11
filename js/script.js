const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const startButton = document.getElementById('startButton');
const gameOverText = document.getElementById('gameOverText');
const scoreDisplay = document.getElementById('score');
const nameInputSection = document.getElementById('nameInputSection');
const playerNameInput = document.getElementById('playerName');
const setNameButton = document.getElementById('setNameButton');
const leaderboardTable = document.querySelector('#leaderboard tbody');

let playerName = '';
let gameInterval = null;
let isGameOver = false;

// Fetch the leaderboard and player name on page load
window.addEventListener('load', () => {
    fetchLeaderboard();
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
        playerName = storedName;
        nameInputSection.style.display = 'none';
        startButton.style.display = 'block';
    } else {
        nameInputSection.style.display = 'block';
        startButton.style.display = 'none';
    }
});

function startGame() {
    startButton.style.display = 'none';
    gameOverText.style.display = 'none';
    isGameOver = false;

    fetchPlayerState();
    gameInterval = setInterval(gameLoop, 50);
}

async function fetchPlayerState() {
    // Fetch player state from server and update the score and position
    const response = await fetch('/api/player-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, action: 'fetchState' })
    });
    const { player } = await response.json();
    scoreDisplay.textContent = `Score: ${player.score}`;
}

function movePlayerWithMouse(event) {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const mouseX = event.clientX - gameAreaRect.left;

    const playerPosition = mouseX - (player.clientWidth / 2);
    player.style.left = `${Math.max(0, Math.min(gameArea.clientWidth - player.clientWidth, playerPosition))}px`;

    // Send action to the server
    fetch('/api/player-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, action: playerPosition > player.style.left ? 'moveRight' : 'moveLeft' })
    });
}

function gameLoop() {
    if (!isGameOver) {
        updateFallingBlocks();
        if (Math.random() < 0.05) {
            createFallingBlock();
        }
    }
}

function updateFallingBlocks() {
    const blocks = document.querySelectorAll('.falling-block');
    blocks.forEach(async (block) => {
        const blockTop = parseFloat(block.style.top);
        block.style.top = `${blockTop + 5}px`;

        const blockLeft = parseFloat(block.style.left);
        const playerLeft = parseFloat(player.style.left);

        if (blockTop + 30 > gameArea.clientHeight - 70 && blockLeft < playerLeft + 50 && blockLeft + 30 > playerLeft) {
            block.remove();

            // Send score update to the server
            await fetch('/api/player-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName, action: 'catchBlock' })
            });

            // Fetch the updated player state after catching the block
            fetchPlayerState();
        }

        if (blockTop + 30 > gameArea.clientHeight) {
            gameOver();
        }
    });
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    gameOverText.style.display = 'block';

    // Clear blocks
    document.querySelectorAll('.falling-block').forEach(block => block.remove());

    setTimeout(() => {
        gameOverText.style.display = 'none';
        startButton.style.display = 'block';

        // Submit final score to leaderboard
        submitScore(playerName);
    }, 2000);
}

async function submitScore(name) {
    const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: parseInt(scoreDisplay.textContent.split(': ')[1]) })
    });
    const data = await response.json();
    fetchLeaderboard();
}

async function fetchLeaderboard() {
    const response = await fetch('/api/leaderboard');
    const data = await response.json();

    leaderboardTable.innerHTML = '';
    data.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${player.name}</td><td>${player.score}</td>`;
        leaderboardTable.appendChild(row);
    });
}

gameArea.addEventListener('mousemove', movePlayerWithMouse);
startButton.addEventListener('click', startGame);
