document.addEventListener("DOMContentLoaded", () => {
  const mainImage = document.getElementById("mainImage");
  const thumbnails = document.querySelectorAll(".thumbnails img");

  thumbnails.forEach(thumb => {
    thumb.addEventListener("click", () => {
      // Hauptbild wechseln
      mainImage.src = thumb.src;

      // Aktiven Thumbnail markieren
      thumbnails.forEach(t => t.classList.remove("active-thumb"));
      thumb.classList.add("active-thumb");
    });
  });
})

  // Swipe für Handy
 // let startX = 0;
//  let currentIndex = 0;

//  mainImage.addEventListener("touchstart", e => {
//    startX = e.touches[0].clientX;
//  });

//  mainImage.addEventListener("touchend", e => {
//    let endX = e.changedTouches[0].clientX;
//    if (endX < startX - 50) {
      // nach links wischen
   //   currentIndex = (currentIndex + 1) % thumbnails.length;
  //  } else if (endX > startX + 50) {
      // nach rechts wischen
   //   currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
  //  }
   // mainImage.src = thumbnails[currentIndex].src;
   // thumbnails.forEach(t => t.classList.remove("active-thumb"));
  //  thumbnails[currentIndex].classList.add("active-thumb");
//  });
//})
