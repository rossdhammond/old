document.addEventListener('DOMContentLoaded', function() {
  // Get the bottom window element
  const bottomWindow = document.getElementById('bottom-window');

  // Get all the buttons
  const buttons = document.querySelectorAll('.interactive-window button');

  // Function to change the bottom window image
  function changeImage(imagePath) {
    bottomWindow.innerHTML = `<img src="${imagePath}" alt="New Image">`;
  }

  // Add click event listener to each button
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      // Determine which button was clicked
      const buttonId = this.id;
      
      // Change the image based on the button clicked
      switch (buttonId) {
        case 'button1':
          changeImage('image2.jpeg');
          break;
        case 'button2':
          changeImage('image3.jpeg');
          break;
        case 'button3':
          changeImage('image4.jpeg');
          break;
        case 'button4':
          changeImage('image5.jpeg');
          break;
        case 'button5':
          changeImage('image6.jpeg');
          break;
        case 'button6':
          changeImage('image7.jpeg');
          break;
        default:
          changeImage('default-image.jpeg');
      }
    });
  });
});
