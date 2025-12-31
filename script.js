function createLoop(trackId, speed = 0.5) {
  const track = document.getElementById(trackId);

  function startLoop() {
    const clone = track.cloneNode(true);
    clone.classList.add("clone");
    track.parentElement.appendChild(clone);

    // Position clone AFTER the original
    clone.style.left = track.offsetWidth + "px";

    let x = 0;

    function animate() {
      x -= speed;

      track.style.transform = `translateX(${x}px)`;
      clone.style.transform = `translateX(${x}px)`;

      if (Math.abs(x) >= track.offsetWidth) {
        x = 0;
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Wait for images to load before measuring width
  const images = track.querySelectorAll("img");
  let loaded = 0;

  images.forEach(img => {
    if (img.complete) {
      loaded++;
      if (loaded === images.length) startLoop();
    } else {
      img.onload = () => {
        loaded++;
        if (loaded === images.length) startLoop();
      };
    }
  });
}

createLoop("programming-track", 0.4);
createLoop("design-track", 0.4);
