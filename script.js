document.addEventListener('DOMContentLoaded', function() {
  // Get the bottom window element
  const bottomWindow = document.getElementById('bottom-window');

  // Get the audio controls
  const playButton = document.getElementById('play-button');
  const pauseButton = document.getElementById('pause-button');
  const genreDropdown = document.getElementById('genre-dropdown');
  const audio = new Audio();

  // Function to change the bottom window image
  function changeImage(imagePath) {
    const imageElement = bottomWindow.querySelector('img');
    imageElement.src = imagePath;
  }

  // Function to play audio based on genre selection
  function playAudio(genre) {
    let audioSrc = '';
    switch (genre) {
      case 'pop':
        audioSrc = 'pop-music.mp3';
        break;
      case 'musical':
        audioSrc = 'musical-music.mp3';
        break;
      case 'jazz':
        audioSrc = 'jazz-music.mp3';
        break;
      default:
        return;
    }
    audio.src = audioSrc;
    audio.play();
  }

  // Add click event listener to the play button
  playButton.addEventListener('click', function() {
    audio.play();
  });

  pauseButton.addEventListener('click', function() {
    audio.pause();
  });

  genreDropdown.addEventListener('click', function(event) {
    const genre = event.target.getAttribute('data-genre');
    playAudio(genre);
  });
});
