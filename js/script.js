let gameInterval;
let isGameOver = false;
let playerName = '';

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
    clearInterval(gameInterval);
    playerPosition = gameArea.clientWidth / 2 - player.clientWidth / 2;
    player.style.left = `${playerPosition}px`;

    // Notify server that the game started
    fetch('/api/startGame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: playerName })
    });

    gameInterval = setInterval(gameLoop, 50);
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
            block.remove();

            // Notify server about collision
            fetch('/api/collision', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: playerName })
            }).then(response => response.json())
            .then(data => {
                // Update score from the server response
                scoreDisplay.textContent = `Score: ${data.score}`;
            });
        }
    });
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);

    gameOverText.style.display = 'block';

    document.querySelectorAll('.falling-block').forEach(block => block.remove());

    setTimeout(() => {
        gameOverText.style.display = 'none';
        startButton.style.display = 'block';

        // Notify the server about game over
        fetch('/api/gameOver', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: playerName })
        });
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
