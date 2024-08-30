// app.js or equivalent file in your frontend project

const API_URL = 'https://dog-blush-six.vercel.app'; // Your backend URL

async function fetchLeaderboard() {
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log(data); // Handle the data and render it on the page
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

fetchLeaderboard();
