"use strict";
window.onload = test();
function test(){
    const testDiv = document.getElementById("testDiv");
    let content = "";
    for(let i = 1; i <=100; i++) {
       content +=
       `${i} <br>`;
    }
    testDiv.innerHTML = content;
}

window.addEventListener('scroll', function () {
    const parallaxImage = document.querySelector('.parallax-image');
    const scrollPosition = window.scrollY; // מקבל את מיקום הגלילה
    const speed = 0.4; // קובע את מהירות תנועת התמונה

    // מחשב את המיקום החדש של התמונה של המטבעות לפי הגלילה
    parallaxImage.style.transform = 'translate3d(0, ' + (scrollPosition * speed) + 'px, 0)';
});
