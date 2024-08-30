document.addEventListener('DOMContentLoaded', () => {
  const videoForward = document.getElementById('videoForward');
  const videoReverse = document.getElementById('videoReverse');

  let isForwardPlaying = true;

  function switchVideo() {
    if (isForwardPlaying) {
      videoForward.pause();
      videoForward.style.display = 'none';
      videoReverse.style.display = 'block';
      videoReverse.play();
    } else {
      videoReverse.pause();
      videoReverse.style.display = 'none';
      videoForward.style.display = 'block';
      videoForward.play();
    }
    isForwardPlaying = !isForwardPlaying;
  }

  videoForward.addEventListener('ended', switchVideo);
  videoReverse.addEventListener('ended', switchVideo);

  videoForward.play(); // Start the forward video
});