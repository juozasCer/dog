const API_URL = 'https://dog-blush-six.vercel.app'; // Your backend URL

async function fetchLeaderboard() {
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
    const data = await response.json();
    console.log('Leaderboard Data:', data); // Log data for debugging

    // Assuming you have a table with id 'leaderboard'
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

// Call the function to load the leaderboard data
fetchLeaderboard();
