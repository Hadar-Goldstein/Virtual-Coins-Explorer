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
    const parallaxBg = document.querySelector('.parallax-bg');
    const navLinks = document.querySelectorAll('nav a');
    const scrollPosition = window.scrollY; // מיקום הגלילה
    const speed = 0.4; // מהירות תנועת התמונה

    // אנימציית הפרלקס
    parallaxImage.style.transform = 'translate3d(0, ' + (scrollPosition * speed) + 'px, 0)';

    // שינוי צבע הקישורים ב-nav
    const parallaxBgBottom = parallaxBg.getBoundingClientRect().bottom; // גבול התחתון של הפרלקס
    if (parallaxBgBottom <= 0) {
        // אם הגלילה עברה את סוף הפרלקס
        navLinks.forEach(link => {
            link.style.color = 'black'; // צבע טקסט שחור
        });
    } else {
        // אם ה-nav עדיין על גבי הרקע
        navLinks.forEach(link => {
            link.style.color = '#d9d9d9'; // הצבע המקורי
        });
    }
});
