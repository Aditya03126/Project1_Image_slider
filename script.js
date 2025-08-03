
/**
 * Image Slider JavaScript
 * This script implements an interactive image slider with navigation buttons,
 * indicator dots, autoplay functionality, and touch/swipe support.
 */

// Default images to use in the slider
const defaultImages = [
  'images/image1.jpg',
  'images/image2.jpg',
  'images/image3.jpg',
  'images/image4.jpg',
  'images/image5.jpg'
];

// Initialize the images array with default images
let images = [...defaultImages];
let currentIndex = 0;
let autoplay = true;
let timer = null;
let autoplayInterval = 3000; // 3 seconds

// Get DOM elements
const imageInput = document.getElementById('imageInput');
const slider = document.getElementById('slider');
const dots = document.getElementById('dots');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const autoplayToggle = document.getElementById('autoplayToggle');

/**
 * Initialize the slider when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
  renderImages();
  updateSlider();
  startAutoplay();
  
  // Set initial autoplay button state with Font Awesome icon
  autoplayToggle.innerHTML = autoplay ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
  
  // Initialize slide counter
  updateSlideCounter();
  
  // Add subtle animation class to slider container
  document.querySelector('.slider-container').classList.add('initialized');
});

/**
 * Handle user-selected images
 */
imageInput.addEventListener('change', function(event) {
  const files = Array.from(event.target.files);
  if (files.length) {
    images = [];
    files.forEach(file => {
      // Only process image files
      if (!file.type.match('image.*')) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        images.push(e.target.result);
        if (images.length === files.length) {
          currentIndex = 0;
          renderImages();
          updateSlider();
        }
      };
      reader.readAsDataURL(file);
    });
  } else {
    // If no files selected, revert to default images
    images = [...defaultImages];
    currentIndex = 0;
    renderImages();
    updateSlider();
  }
});

/**
 * Render all images in the slider
 */
function renderImages() {
  slider.innerHTML = '';
  if (images.length === 0) {
    // If no images, use defaults
    images = [...defaultImages];
  }
  
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Slider Image';
    img.loading = 'lazy'; // Lazy load images for better performance
    img.addEventListener('click', function() {
      // Toggle zoom on click
      if (currentZoom > 1) {
        resetZoom();
      } else {
        currentZoom = 2; // Set to medium zoom level on first click
        applyZoom();
      }
    });
    slider.appendChild(img);
  });
}

/**
 * Render the indicator dots
 */
function renderDots() {
  dots.innerHTML = '';
  images.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to image ${idx+1}`);
    if(idx === currentIndex) dot.classList.add('active');
    dot.onclick = () => { goTo(idx); };
    dots.appendChild(dot);
  });
}

/**
 * Update the slider position, dots, and slide counter
 */
function updateSlider() {
  slider.style.transform = `translateX(${-currentIndex * 100}%)`;
  renderDots();
  updateSlideCounter();
  
  // Reset zoom level when changing slides
  resetZoom();
}

/**
 * Update the slide counter display
 */
function updateSlideCounter() {
  const currentSlideElement = document.getElementById('current-slide');
  const totalSlidesElement = document.getElementById('total-slides');
  
  if (currentSlideElement && totalSlidesElement) {
    currentSlideElement.textContent = currentIndex + 1;
    totalSlidesElement.textContent = images.length;
  }
}

/**
 * Go to previous image
 */
function prev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateSlider();
  // Reset autoplay timer when manually navigating
  if (autoplay) resetAutoplayTimer();
}

/**
 * Go to next image
 */
function next() {
  currentIndex = (currentIndex + 1) % images.length;
  updateSlider();
  // Reset autoplay timer when manually navigating
  if (autoplay) resetAutoplayTimer();
}

/**
 * Go to a specific image by index
 */
function goTo(idx) {
  currentIndex = idx;
  updateSlider();
  // Reset autoplay timer when manually navigating
  if (autoplay) resetAutoplayTimer();
}

/**
 * Start the autoplay functionality
 */
function startAutoplay() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (autoplay) next();
  }, autoplayInterval);
}

/**
 * Reset the autoplay timer
 */
function resetAutoplayTimer() {
  stopAutoplay();
  startAutoplay();
}

/**
 * Stop the autoplay functionality
 */
function stopAutoplay() {
  if (timer) clearInterval(timer);
  timer = null;
}

// Event listeners for navigation buttons
prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);

// Event listener for autoplay toggle button
autoplayToggle.addEventListener('click', function() {
  autoplay = !autoplay;
  
  // Update icon based on autoplay state
  if (autoplay) {
    this.innerHTML = '<i class="fas fa-pause"></i>';
    startAutoplay();
  } else {
    this.innerHTML = '<i class="fas fa-play"></i>';
    stopAutoplay();
  }
});

// Touch/Swipe Support
let startX = 0;
let endX = 0;
let isDragging = false;
const threshold = 50; // Minimum distance to be considered a swipe

// Touch start event
slider.addEventListener('touchstart', handleTouchStart, { passive: true });
slider.addEventListener('mousedown', handleTouchStart);

// Touch move event
slider.addEventListener('touchmove', handleTouchMove, { passive: true });
slider.addEventListener('mousemove', handleTouchMove);

// Touch end event
slider.addEventListener('touchend', handleTouchEnd);
slider.addEventListener('mouseup', handleTouchEnd);
slider.addEventListener('mouseleave', handleTouchEnd);

/**
 * Handle touch/mouse start event
 */
function handleTouchStart(e) {
  startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  isDragging = true;
}

/**
 * Handle touch/mouse move event
 */
function handleTouchMove(e) {
  if (!isDragging) return;
  endX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const diff = endX - startX;
  
  // Prevent default behavior only if it's a significant drag
  if (Math.abs(diff) > 10 && e.cancelable) {
    e.preventDefault();
  }
}

/**
 * Handle touch/mouse end event
 */
function handleTouchEnd() {
  if (!isDragging) return;
  isDragging = false;
  
  const diff = endX - startX;
  if (Math.abs(diff) < threshold) return; // Not a swipe
  
  if (diff > 0) {
    // Swipe right, go to previous image
    prev();
  } else {
    // Swipe left, go to next image
    next();
  }
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft') {
    prev();
  } else if (e.key === 'ArrowRight') {
    next();
  } else if (e.key === 'Escape' && document.querySelector('.fullscreen-mode')) {
    closeFullscreen();
  } else if (e.key === '+') {
    zoomIn();
  } else if (e.key === '-') {
    zoomOut();
  } else if (e.key === 'f') {
    toggleFullscreen();
  }
});

// Pause autoplay when page is not visible
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Page is hidden, pause autoplay
    if (autoplay) stopAutoplay();
  } else {
    // Page is visible again, resume autoplay if it was on
    if (autoplay) startAutoplay();
  }
});

/**
 * Zoom functionality
 */
let currentZoom = 1;
const minZoom = 1;
const maxZoom = 3;
const zoomStep = 0.5;

// Get zoom control buttons
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const fullscreenBtn = document.getElementById('fullscreen');

// Add event listeners for zoom controls
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);
fullscreenBtn.addEventListener('click', toggleFullscreen);

/**
 * Zoom in the current image
 */
function zoomIn() {
  if (currentZoom < maxZoom) {
    currentZoom += zoomStep;
    applyZoom();
  }
}

/**
 * Zoom out the current image
 */
function zoomOut() {
  if (currentZoom > minZoom) {
    currentZoom -= zoomStep;
    applyZoom();
  }
}

/**
 * Apply the current zoom level to the active image
 */
function applyZoom() {
  const currentImage = slider.children[currentIndex];
  if (currentImage) {
    currentImage.style.transform = `scale(${currentZoom})`;
    currentImage.style.transition = 'transform 0.3s ease';
    
    // Add or remove zoomed class based on zoom level
    if (currentZoom > 1) {
      currentImage.classList.add('zoomed');
    } else {
      currentImage.classList.remove('zoomed');
    }
  }
}

/**
 * Reset zoom level to default
 */
function resetZoom() {
  currentZoom = 1;
  const images = slider.querySelectorAll('img');
  images.forEach(img => {
    img.style.transform = 'scale(1)';
  });
}

/**
 * Toggle fullscreen mode for the current image
 */
function toggleFullscreen() {
  const currentImage = slider.children[currentIndex];
  if (!currentImage) return;
  
  // Check if we're already in fullscreen mode
  const existingFullscreen = document.querySelector('.fullscreen-mode');
  if (existingFullscreen) {
    closeFullscreen();
    return;
  }
  
  // Create fullscreen container
  const fullscreenContainer = document.createElement('div');
  fullscreenContainer.className = 'fullscreen-mode';
  
  // Create a clone of the current image
  const fullscreenImage = document.createElement('img');
  fullscreenImage.src = currentImage.src;
  fullscreenImage.alt = currentImage.alt;
  fullscreenImage.className = 'slider-image';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'close-fullscreen';
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.addEventListener('click', closeFullscreen);
  
  // Add elements to the container
  fullscreenContainer.appendChild(fullscreenImage);
  fullscreenContainer.appendChild(closeButton);
  
  // Add to the document
  document.body.appendChild(fullscreenContainer);
  
  // Pause autoplay when in fullscreen
  if (autoplay) {
    const wasAutoplay = autoplay;
    stopAutoplay();
    fullscreenContainer.addEventListener('click', function(e) {
      if (e.target === fullscreenContainer) {
        closeFullscreen();
        if (wasAutoplay) startAutoplay();
      }
    });
  }
}

/**
 * Close fullscreen mode
 */
function closeFullscreen() {
  const fullscreenContainer = document.querySelector('.fullscreen-mode');
  if (fullscreenContainer) {
    document.body.removeChild(fullscreenContainer);
  }
}
