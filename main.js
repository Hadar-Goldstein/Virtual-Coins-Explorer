/// <reference path="jquery-3.7.1.js"/>
"use strict";

// Only for tests
// **************
window.onload = function () {
    // test();
    getCoinsData();
};
// function test() {
//     const testDiv = document.getElementById("testDiv");
//     let content = "";
//     for (let i = 1; i <= 100; i++) {
//         content +=
//             `${i} <br>`;
//     }
//     testDiv.innerHTML = content;
// }

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

// --------------------------------------------------------------------------------------------------

async function getCoinsData() {
    const url = "https://api.coingecko.com/api/v3/coins/list";
    const response = await axios.get(url);
    const coins = response.data;
    displayCoins(coins);
}

function displayCoins(coins) {
    const cardsContainer = document.getElementById("cardsContainer");
    let content = "";
    for (let i = 0; i <= coins.length; i++) {
        let coin = coins[i];
        content += `
        <div class="card">
            <div class="coinIdentity">
                <span class="symbolSpan">${coin.symbol}</span>
                <span class="symbolName">${coin.name}</span>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                </div>
            </div>

        <span>
            <button class="infoBtn">More Information</button>
        </span>
        </div>`;
        if (i === 20)
            break;
    }
    cardsContainer.innerHTML += content;
}