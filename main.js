/// <reference path="jquery-3.7.1.js"/>
"use strict";

(()=>{

// Global Variables
// ****************
const liveReportCapacity = 5;
let clickTimes = new Map();
let coinsFrontData = new Map();
let coinsPrices = new Map();
let coinsArray = [];

const priceSymbols = new Map();
priceSymbols.set("eur", "\u20AC");
priceSymbols.set("usd", "\u0024");
priceSymbols.set("ils", "\u20AA");

// --------------------------------------------------------------------------------------------------

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
    const eurChecked = $('#eur').prop('checked');
    const usdChecked = $('#usd').prop('checked');
    const ilsChecked = $('#ils').prop('checked');


    let optionsList = new Map;

    optionsList.set("eur", eurChecked);
    optionsList.set("usd", usdChecked);
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
    try {
        // const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
        const url = "coins.json"; // for testing
        const response = await axios.get(url);
        const coins = response.data;
        displayCoins(coins);
        saveCoinsFrontData(coins);
        setStorageToggles();
    }
    catch(err) {
        console.log("Can't get data from API");
        alert(err.message);
    }
}


// Display front-card based on API data
// ************************************
function displayCoins(coins) {
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
                    <input id="${coin.id}-toggle" class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                </div>
            </div>
        <span>
            <button id="${coin.id}-infoBtn" class="infoBtn">More Information</button>
        </span>
        </div>`;
    }
    $("#cardsContainer").html(content);


    $(".infoBtn").on("click", function () {
        const coinId = this.id; 
        const splitted = coinId.split("-");
        const id = splitted[0];
        backCardHandling(id);
    });

    $(".form-check-input").on("click", function () {
        const fullId = this.id;
        const coinId = fullId.split("-")[0];
        selectedCoins(coinId); 
    });
    
}

// More-Information Btn handling
// *****************************
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
function saveCoinsFrontData(coins) {
    for (const item of coins) {
        const key = item.id;
        const image = item.image;
        const symbol = item.symbol;
        const name = item.name;
        const coin = { image, symbol, name};
        coinsFrontData.set(key, coin);
    }
}


// Display front-card via local data
// *********************************
function displayCoinFrontCache(id) {
    if (coinsFrontData.has(id)) {
        const coin = coinsFrontData.get(id);
        const content = `
            <div class="coinIdentity">
                <span class="coinImage"><img src="${coin.image}"></span>
                <div class="coinInfo">
                    <span class="symbolSpan">${coin.symbol.toUpperCase()}</span>
                    <span class="symbolName">${coin.name}</span>
                </div>
                <div class="form-check form-switch">
                    <input id="${id}-toggle" class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                </div>
            </div>
        <span>
            <button id="${id}-infoBtn" class="infoBtn">More Information</button>
        </span>
        `;
        $(`#${id}`).html(content);

        $(".infoBtn").on("click", function () {
            const coinId = this.id; 
            const splitted = coinId.split("-");
            const id = splitted[0];
            backCardHandling(id);
        });
    
        $(".form-check-input").on("change", function () {
            const fullId = this.id;
            const coinId = fullId.split("-")[0];
            selectedCoins(coinId); 
        });

        const existsInLocalStorage = coinsArray.find(coin => coin === id);
        if(existsInLocalStorage !== undefined) {
            const checkbox = $(`#${id}-toggle`);  
            checkbox.prop('checked', true); 
        }

    }
    else {
        getMoreInfo(id);
    }

}


// Get back-card data from API
// ****************************
async function getMoreInfo(id) {
    try {
        loadSVG(id);
        const url = `https://api.coingecko.com/api/v3/coins/${id}`;
        const response = await axios.get(url);
        const coin = response.data;
        
        $(`#${id}`).html("");
        
        console.log("display price from API executed");
        displayMoreInfoCard(coin, id);
        saveCoinPrices(coin, id);
    }
    catch(err) {
        console.log("Can't get data from API");
        alert(err.message);
        displayCoinFrontCache(id);
    }

}

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

    $(`#${id}`).html(`
        <div class="coinPrice">${content}</div>
        <span>
            <button id="${coin.id}-closeBtn" class="closeBtn">Close</button>
        </span> `
    );

    $(".closeBtn").on("click", function () {
        const btnId = this.id;
        const splitted = btnId.split("-");
        const id = splitted[0];
        displayCoinFrontCache(id);
    });
}

// Save back-card data 
// ********************
function saveCoinPrices(coin, id) {
    const eur = coin.market_data.current_price.eur;
    const usd = coin.market_data.current_price.usd;
    const ils = coin.market_data.current_price.ils;
    const coinPrice = { eur, usd, ils };

    coinsPrices.set(`${id}`, coinPrice);
}


// Display back-card via local data
// *********************************
function displayFromCache(id) {

    if (!coinsPrices.has(id)) {
        getMoreInfo(id);
        return;
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
            <button class="infoBtn">Close</button>
        </span>
        `;

    $(".infoBtn").on("click", function () {
        displayCoinFrontCache(id);
    });
    }


// Modal Handling
// **************
function selectedCoins(id) {
    const checkbox = $(`#${id}-toggle`);
    const isChecked = checkbox.prop('checked');    

    console.log(`Changing state of ${id}: ${isChecked ? 'checked' : 'unchecked'}`);

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


    console.log("coinsArray after change:", coinsArray);

    if (coinsArray.length > liveReportCapacity) {
        openModal();
    }
    
    saveInStorage();
}

function openModal() {
    const errorModalDiv = $("#errorModalDiv");
    errorModalDiv.css("display", "none");    

    $("#capacityModal").css("display", "flex");
    $("body").css("overflow", "hidden");
    

    let content = "";
    for (const item of coinsArray) {
        const coinObj = coinsFrontData.get(item);
        const cardSymbol = coinObj.symbol.toUpperCase();

        content += `
            <div class="checkboxContainer">
                <input type="checkbox" id="checkbox-${item}" value="${item}">
                <label for="checkbox-${item}">${cardSymbol}</label><br>
            </div>`;
    }
    $("#selectedCoinsList").html(content);


    $("#closeModalBtn").on("click", closeModal);
    // const closeModalBtn = document.getElementById("closeModalBtn");
    // closeModalBtn.addEventListener("click", closeModal);

    $("#cancelModalBtn").on("click", cancelModal);
    // const cancelModalBtn = document.getElementById("cancelModalBtn");
    // cancelModalBtn.addEventListener("click", cancelModal);
}

function closeModal() {
    for (let i = (coinsArray.length -1); i >= 0; i--) {

        const checkbox = $(`#checkbox-${coinsArray[i]}`);
        const value = checkbox.prop('checked');   

        if (value === true) {
            const toggle = $(`#${coinsArray[i]}-toggle`);
            if(toggle !== null){
                toggle.prop('checked', false);
            }
            coinsArray.splice(i, 1);
        }
    }
    console.log("coinsArray after modal close:", coinsArray);

    saveInStorage();

    if (coinsArray.length > liveReportCapacity) {
        $("#errorModalDiv").css("display", "flex");
    }
    else {
        $("#capacityModal").css("display", "none");
        $("body").css("overflow", "");
        
    }
}

function cancelModal() {
    const lastSelection = coinsArray[coinsArray.length - 1];
    $(`#${lastSelection}-toggle`).prop('checked', false);

    coinsArray.splice((coinsArray.length - 1), 1);

    saveInStorage();

    $("#capacityModal").css("display", "none");
    $("body").css("overflow", "");
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

// Clear Coins Button
// ******************
$(".clearSelectionBtn").on("click", () => {
    for (let i = 0; i < coinsArray.length; i++) {
        $(`#${coinsArray[i]}-toggle`).prop('checked', false);
    }

    coinsArray = [];
    saveInStorage();
});


async function loadSVG(id) {
    const url = "assets/svg/spinner_svg.svg";
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
        $(`#${item}-toggle`).prop('checked', true);
    }
}

$("#liveReportsLink").on("click", ()=>{

    // loadStorageData();
    let string = "";
    const length = coinsArray.length;
    if(length === 0)
        return;
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

})();