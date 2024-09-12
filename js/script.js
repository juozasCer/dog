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
let spawnRate = 0.05; // Default value

window.addEventListener('load', () => {
    fetchLeaderboard();
    fetchSpawnRate().then(fetchedSpawnRate => {
        spawnRate = fetchedSpawnRate; // Update the spawn rate from the server
    });
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
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    clearInterval(gameInterval);
    playerPosition = gameArea.clientWidth / 2 - player.clientWidth / 2;
    player.style.left = `${playerPosition}px`;

    gameInterval = setInterval(gameLoop, 50);
}

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
            blockLeft < playerLeft + 50 &&
            blockLeft + 30 > playerLeft
        ) {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            block.remove();
        }
    });
}

function gameLoop() {
    if (!isGameOver) {
        updateFallingBlocks();
        if (Math.random() < spawnRate) {
            createFallingBlock();
        }
    }
}

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

function movePlayerWithMouse(event) {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const mouseX = event.clientX - gameAreaRect.left;

    playerPosition = mouseX - (player.clientWidth / 2);
    playerPosition = Math.max(0, Math.min(gameArea.clientWidth - player.clientWidth, playerPosition));
    player.style.left = `${playerPosition}px`;
}

gameArea.addEventListener('mousemove', movePlayerWithMouse);

startButton.addEventListener('click', startGame);

setNameButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        fetch('/api/leaderboard')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const existingNames = data.map(player => player.name);
                if (existingNames.includes(name)) {
                    alert('This name is already taken. Please choose another one.');
                } else {
                    playerName = name;
                    localStorage.setItem('playerName', playerName);
                    nameInputSection.style.display = 'none';
                    startButton.style.display = 'block';
                    fetchLeaderboard();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while checking names. Please try again.');
            });
    } else {
        alert('Please enter a valid name');
    }
});

 function fetchSpawnRate() {
    return fetch('/api/spawnRate')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => data.spawnRate)
        .catch(error => {
            console.error('Error fetching spawn rate:', error);
            return 0.05; // Default value in case of error
        });
}

function submitScore(name, score) {
    fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, inputs: [{ event: 'blockCollected', value: score }] })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score submitted:', data);
        fetchLeaderboard();
    })
    .catch(error => console.error('Error:', error));
}

function fetchLeaderboard() {
    fetch('/api/leaderboard')
        .then(response => response.json())
        .then(data => {
            leaderboardTable.innerHTML = '';

            data.forEach((player, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.score}</td>
                `;
                leaderboardTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}
