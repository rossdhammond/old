document.addEventListener('DOMContentLoaded', function() {
  // Get the bottom window element
  const bottomWindow = document.getElementById('bottom-window');

  // Get the audio controls
  const playButton = document.getElementById('play-button');
  const pauseButton = document.getElementById('pause-button');
  const genreDropdown = document.getElementById('genre-dropdown');
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let audioBuffer = null;
  let sourceNode = null;

  // Function to change the bottom window image
  function changeImage(imagePath) {
    const imageElement = bottomWindow.querySelector('img');
    imageElement.src = imagePath;
  }

  // Function to load audio file
  async function loadAudioFile(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
  }

  // Function to play audio based on genre selection
  async function playAudio(genre) {
    let audioUrl = '';
    switch (genre) {
      case 'pop':
        audioUrl = 'pop-music.mp3';
        break;
      case 'musical':
        audioUrl = 'musical-music.mp3';
        break;
      case 'jazz':
        audioUrl = 'jazz-music.mp3';
        break;
      default:
        return;
    }

    // Stop the previous playback
    stopAudio();

    // Load and decode audio file
    audioBuffer = await loadAudioFile(audioUrl);

    // Create a new source node
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
  }

  // Function to stop audio playback
  function stopAudio() {
    if (sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
      sourceNode = null;
    }
  }

  // Add click event listener to the play button
  playButton.addEventListener('click', function() {
    const selectedGenre = genreDropdown.value;
    playAudio(selectedGenre);
  });

  pauseButton.addEventListener('click', function() {
    stopAudio();
  });
});
