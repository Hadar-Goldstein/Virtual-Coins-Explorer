/// <reference path="jquery-3.7.1.js"/>
"use strict";

// Get DOM Elements
const capacityModal = document.getElementById("capacityModal");

// On Load 
// *******
window.onload = function () {
    getCoinsData();
};


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
    // const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    const url = "coins.json";
    const response = await axios.get(url);
    const coins = response.data;
    displayCoins(coins);
}

function displayCoins(coins) {
    const cardsContainer = document.getElementById("cardsContainer");
    let content = "";
    for (let i = 0; i < coins.length; i++) {
        let coin = coins[i];
        content += `
        <div class="card mb-3" style="width: 13.5rem;" id="${coin.id}">
            <div class="coinIdentity">
                <span class="coinImage"><img src="${coin.image}"></span>
                <div class="coinInfo">
                    <span class="symbolSpan">${coin.symbol}</span>
                    <span class="symbolName">${coin.name}</span>
                </div>
                <div class="form-check form-switch">
                    <input onclick="selectedCoins('${coin.id}')" id="${coin.id}-toggle" class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                </div>
            </div>

        <span>
            <button onclick="getMoreInfo('${coin.id}')" class="infoBtn">More Information</button>
        </span>
        </div>`;
    }
    cardsContainer.innerHTML += content;
}


async function getMoreInfo(id) {
    const url = `https://api.coingecko.com/api/v3/coins/${id}`;
    const response = await axios.get(url);
    const coin = response.data;
    displayMoreInfoCard(coin, id);
}

function displayMoreInfoCard(coin, id) {
    const coinDiv = document.getElementById(`${id}`);
    coinDiv.innerHTML = `
    <span>${coin.market_data.current_price.eur} EUR</span>
    <span>${coin.market_data.current_price.usd} USD</span>
    <span>${coin.market_data.current_price.ils} ILS</span>
    `;
}

let coinsArray = [];
let modal = document.getElementById("myModal");
function selectedCoins(id) {
    const checkbox = document.getElementById(`${id}-toggle`);
    const isChecked = checkbox.checked;

    if (isChecked) {
        const coin = id;
        coinsArray.push(coin);
    }
    else {
        for (let i = 0; i < coinsArray.length; i++) {
            if (coinsArray[i] === id)
                coinsArray.splice(i, 1);
        }
    }

    if (coinsArray.length === 6) {
        openModal();
    }
}



function openModal() {
    const selectedCoinsList = document.getElementById("selectedCoinsList");
    const errorModalDiv = document.getElementById("errorModalDiv");
    errorModalDiv.style.display = "none";

    capacityModal.style.display = "flex";
    document.body.style.overflow = 'hidden';

    let content = "";
    for (const item of coinsArray) {
        content += `
            <div class="checkboxContainer">
                <input type="checkbox" id="checkbox-${item}" value="${item}">
                <label for="checkbox-${item}">${item}</label><br>
            </div>`;
    }
    selectedCoinsList.innerHTML = content;

    const closeModalBtn = document.getElementById("closeModalBtn");
    closeModalBtn.addEventListener("click", closeModal);
}

function closeModal() {
    for (let i = 0; i < coinsArray.length; i++) {

        const checkbox = document.getElementById(`checkbox-${coinsArray[i]}`);
        const value = checkbox.checked;

        if (value === false) {
            const toggle = document.getElementById(`${coinsArray[i]}-toggle`);
            toggle.checked = false;
            coinsArray.splice(i, 1);
        }
    }

    console.log(coinsArray);

    if (coinsArray.length > 5) {
        $("#errorModalDiv").css("display", "flex");
    }
    else{
        capacityModal.style.display = "none";
        document.body.style.overflow = '';
    }
}