/// <reference path="jquery-3.7.1.js"/>
"use strict";

// Only for tests
// **************
window.onload = function () {
    test();
};
function test() {
    const testDiv = document.getElementById("testDiv");
    let content = "";
    for (let i = 1; i <= 100; i++) {
        content +=
            `${i} <br>`;
    }
    testDiv.innerHTML = content;
}

// Parallax Animation 
// ******************
$(window).scroll(() => {
    // Create animation
    const scrollPositionY = $(window).scrollTop();
    const speed = 0.4;
    $(".parallaxImage").css("transform", `translate3d(0, ${scrollPositionY * speed}px, 0)`);

    // Adjust navbar color
    const backgroundHeight = $(".parallaxBg").outerHeight();
    if (backgroundHeight <= scrollPositionY)
        $("nav a").css("color", "black");
    else
        $("nav a").css("color", "#d9d9d9");
});
