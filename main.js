/// <reference path="jquery-3.7.1.js"/>
"use strict";

// Get DOM Elements
const capacityModal = document.getElementById("capacityModal");



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

function getDisplayList() {
    // Check user choices 
    const eur = document.getElementById(`eur`);
    const usd = document.getElementById(`usd`);
    const ils = document.getElementById(`ils`);

    let optionsList = new Map;

    const eurChecked = eur.checked;
    optionsList.set("eur", eurChecked);
    const usdChecked = usd.checked;
    optionsList.set("usd", usdChecked);
    const ilsChecked = ils.checked;
    optionsList.set("ils", ilsChecked);

    let displayList = [];
    optionsList.forEach((value, key) => {
        if (value === true)
            displayList.push(key);
    });

    // If all false display all types
    if (displayList.length === 0) {
        displayList = ["eur", "usd", "ils"];
    }

    return displayList;
}



// --------------------------------------------------------------------------------------------------
// On Load 
// *******

$(function() {
    // Once the Website is loaded run code
    getCoinsData();

    $("#coinsLink").on("click", function() {
        getCoinsData();
    });
});



// Get front-card data from API
// ****************************
async function getCoinsData() {
    // const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    const url = "coins.json";
    const response = await axios.get(url);
    const coins = response.data;
    displayCoins(coins);
    saveCoinsFrontData(coins);
    setStorageToggles();
}


// Display front-card based on API data
// ************************************
function displayCoins(coins) {
    const cardsContainer = document.getElementById("cardsContainer");
    let content = "";
    for (const coin of coins) {
        content += `
        <div class="card mb-3" style="width: 13.5rem;" id="${coin.id}">
            <div class="coinIdentity">
                <span class="coinImage"><img src="${coin.image}"></span>
                <div class="coinInfo">
                    <span class="symbolSpan">${coin.symbol.toUpperCase()}</span>
                    <span class="symbolName">${coin.name}</span>
                </div>
                <div class="form-check form-switch">
                    <input onclick="selectedCoins('${coin.id}')" id="${coin.id}-toggle" class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                </div>
            </div>
        <span>
            <button onclick="backCardHandling('${coin.id}')" class="infoBtn">More Information</button>
        </span>
        </div>`;
    }
    cardsContainer.innerHTML += content;
}

// More-Information Btn handling
// *****************************

let clickTimes = new Map();

function backCardHandling(id) {
    const currentClickTime = Date.now();

    if (clickTimes.has(id)) {
        const lastTimeClick = clickTimes.get(id);
        const timeDiff = currentClickTime - lastTimeClick;
        console.log(`time diff = ${timeDiff / 60000}`);
        const updateTime = 120000;

        if (timeDiff > updateTime) {
            clickTimes.set(id, currentClickTime);
            getMoreInfo(id);
        }
        else {
            displayFromCache(id);
        }

    }
    else {
        clickTimes.set(id, currentClickTime);
        getMoreInfo(id);
    }
}


// Save front-card data 
// ********************
let coinsFrontData = new Map();

function saveCoinsFrontData(coins) {
    for (const item of coins) {
        const key = item.id;
        const image = item.image;
        const symbol = item.symbol;
        const name = item.name;
        const coin = { image, symbol, name };
        coinsFrontData.set(key, coin);
    }

    // coinsFrontData.forEach((value, key) => {
    //     console.log(key, value);
    // });
}


// Display front-card via local data
// *********************************
function displayCoinFrontCache(id) {
    if (coinsFrontData.has(id)) {
        const coin = coinsFrontData.get(id);
        const cardElement = document.getElementById(id);
        cardElement.innerHTML = `
            <div class="coinIdentity">
                <span class="coinImage"><img src="${coin.image}"></span>
                <div class="coinInfo">
                    <span class="symbolSpan">${coin.symbol.toUpperCase()}</span>
                    <span class="symbolName">${coin.name}</span>
                </div>
                <div class="form-check form-switch">
                    <input onclick="selectedCoins('${id}')" id="${id}-toggle" class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                </div>
            </div>
        <span>
            <button onclick="backCardHandling('${id}')" class="infoBtn">More Information</button>
        </span>
        `;
    }
    else {
        getMoreInfo(id);
    }

}


// Get back-card data from API
// ****************************
async function getMoreInfo(id) {
    loadSVG(id);
    const url = `https://api.coingecko.com/api/v3/coins/${id}`;
    const response = await axios.get(url);
    const coin = response.data;

    $(`#${id}`).html("");
    // const coinDiv = document.getElementById(id);
    // coinDiv.innerHTML = "";  // מנקה את ה-SVG ומכין מקום לתצוגת מחירים

    console.log("display price from API executed");
    displayMoreInfoCard(coin, id);
    saveCoinPrices(coin, id);

}

const priceSymbols = new Map();
priceSymbols.set("eur", "\u20AC");
priceSymbols.set("usd", "\u0024");
priceSymbols.set("ils", "\u20AA");


// Display back-card data based on API data
// ****************************************
function displayMoreInfoCard(coin, id) {


    const displayList = getDisplayList();
    const apiObj = "market_data.current_price";

    let content = "";
    for (const item of displayList) {
        const symbol = priceSymbols.get(item);
        const path = `${apiObj}.${item}`;

        const keys = path.split(".");
        const apiData = keys.reduce((obj, key) => obj && obj[key], coin);

        content += `
        <span>${apiData} ${symbol}</span>
        `;
    }

    const coinDiv = document.getElementById(`${id}`);
    coinDiv.innerHTML =
        `<div class="coinPrice">${content}</div>
    <span>
        <button onclick="displayCoinFrontCache('${coin.id}')" class="infoBtn">Close</button>
     </span>
    `;
}

// Save back-card data 
// ********************
let coinsPrices = new Map();

function saveCoinPrices(coin, id) {
    const eur = coin.market_data.current_price.eur;
    const usd = coin.market_data.current_price.usd;
    const ils = coin.market_data.current_price.ils;
    const coinPrice = { eur, usd, ils };

    coinsPrices.set(`${id}`, coinPrice);

    // coinsPrices.forEach((value, key) => {
    //     console.log(key, value);
    // });
}


// Display back-card via local data
// *********************************
function displayFromCache(id) {
    console.log("display price from cache executed");

    if (!coinsPrices.has(id)) {
        getMoreInfo(id);
    }

    const displayList = getDisplayList();


    let content = "";
    for (const item of displayList) {
        const symbol = priceSymbols.get(item);
        const pricesObj = coinsPrices.get(id);
        const price = pricesObj[item];

        content += `
            <span>${price} ${symbol}</span>
            `;
    }

    const coinDiv = document.getElementById(`${id}`);
    coinDiv.innerHTML =`
        <div class="coinPrice">${content}</div>
        <span>
            <button onclick="displayCoinFrontCache('${id}')" class="infoBtn">Close</button>
        </span>
        `;
    }


// Modal Handling
// **************
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
    
    saveInStorage();

    if (coinsArray.length > 5) {
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
    saveInStorage();
    console.log(coinsArray);

    if (coinsArray.length > 5) {
        $("#errorModalDiv").css("display", "flex");
    }
    else {
        capacityModal.style.display = "none";
        document.body.style.overflow = '';
    }
}


// Coins Navbar Handling
// *********************

// Dynamic Search
// **************
$("#dynamicSearch").on("input", function () {
    // Get user input 
    const userInput = $(this).val().toLowerCase();
    let hasResults = false;

    // Check each symbol text in cards
    $(".card").each(function () {
        const cardSymbol = $(this).find(".symbolSpan");
        const cardSymbolText = cardSymbol.text().toLowerCase();
        if (cardSymbolText.includes(userInput)) {
            $(this).show();
            hasResults = true;
        } else {
            $(this).hide();
        }
    });

    // No result handling
    if (!hasResults)
        $(noResultsContainer).show();
    else
        $(noResultsContainer).hide();
});


// Clear Button 
// ************
$(".clearBtn").on("click", () => {
    $("#dynamicSearch").val("").trigger("input");
});



async function loadSVG(id) {
    const url = "assets/test2.svg";
    const response = await axios.get(url);
    const svg = response.data;
    // Set SVG to specific card
    $(`#${id}`).html(`${svg}`);

    // SVG CSS to make sure its inside the card
    const svgElement = $(`#${id}`).find('svg');
    svgElement.css({
        "max-width": "100%",
        "max-height": "100%",
        "display": "block",
        "margin": "auto"
    });
}


// Bonus Test

const url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=USD,EUR";
const apiKey = "de74120914e79001714c5592aac92671b8bacbf2f50377763b1e657b292277d8";

// Local Storage save
// ******************
function saveInStorage() {
    const json = JSON.stringify(coinsArray);
    localStorage.setItem("selectedCoins", json);
}

function loadStorageData() {
    const selectedCoinsJson = localStorage.getItem("selectedCoins");
    if (selectedCoinsJson) {
        coinsArray = JSON.parse(selectedCoinsJson);
    }
}

function setStorageToggles() {
    loadStorageData();
    for(const item of coinsArray) {
        const checkbox = document.getElementById(`${item}-toggle`);
        checkbox.checked = true;
    }
}

$("#liveReportsLink").on("click", ()=>{

    loadStorageData();
    let string = "";
    const length = coinsArray.length;
    let counter = 0;
    for(const item of coinsArray) {
        counter++;
        const coinObj = coinsFrontData.get(item);
        const coinSymbol = coinObj.symbol;

        if(counter === length)
            string+= `${coinSymbol}`;
        else
            string+= `${coinSymbol},`;
    }

    const saveString = string.toUpperCase();

    const json = JSON.stringify(saveString);
    localStorage.setItem("symbolsString", json);
});