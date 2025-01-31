/// <reference path="jquery-3.7.1.js"/>
"use strict";

(() => {
    // Global Variables
    // ****************
    const liveReportCapacity = 5;
    const timeForApiUpdate = 120000;
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
        $(".parallaxImage").css(
            "transform",
            `translate3d(0, ${scrollPositionY * speed}px, 0)`
        );

        // Adjust navbar color
        const backgroundHeight = $(".parallaxBg").outerHeight();
        if (backgroundHeight <= scrollPositionY) $("nav a").css("color", "black");
        else $("nav a").css("color", "#d9d9d9");
    });

    // --------------------------------------------------------------------------------------------------
    
    function getUserDisplayList() {
        // Check user choices
        const eurChecked = $("#eur").prop("checked");
        const usdChecked = $("#usd").prop("checked");
        const ilsChecked = $("#ils").prop("checked");

        let optionsList = new Map();

        optionsList.set("eur", eurChecked);
        optionsList.set("usd", usdChecked);
        optionsList.set("ils", ilsChecked);

        let displayList = [];
        optionsList.forEach((value, key) => {
            if (value === true) 
                displayList.push(key);
        });

        // If all false display all types
        if (displayList.length === 0)
            displayList = ["eur", "usd", "ils"];

        return displayList;
    }

    function getCoinId(btn) {
        let btnArray = btn.split("-");
        btnArray.splice(btnArray.length - 1, 1);
        const coinId = btnArray.join("-");
        return coinId;
    }

    // --------------------------------------------------------------------------------------------------

    // On Load
    // *******
    $(function () {
        // Once the Website is loaded run code
        getCoinsDataFromApi();

        $("#coinsLink").on("click", function () {
            getCoinsDataFromApi();
        });
    });

    // --------------------------------------------------------------------------------------------------

    // Events
    // ******
    $(document).on("click", ".infoBtn", function () {
        const btnArray = this.id; 
        backCardHandling(btnArray);
    });
    
    $(document).on("click", ".form-check-input", function () {
        const toggleId = this.id; 
        selectedCoinsHandling(toggleId);
    });

    $(document).on("click", ".closeBtn", function () {
        const btnArray = this.id; 
        const coinId = getCoinId(btnArray); 
        displayFrontDataFromLocalData(coinId);
    });

    $("#closeModalBtn").on("click", closeModal);

    $("#cancelModalBtn").on("click", cancelModal);
    
    // --------------------------------------------------------------------------------------------------

    // Get front-card data from API
    // ****************************
    async function getCoinsDataFromApi() {
        try {
            // const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
            const url = "coins.json"; // for testing
            const response = await axios.get(url);
            const coins = response.data;
            displayFrontCardFromApi(coins);
            saveCoinsFrontData(coins);
            setStorageToggles();
        } 
        catch (err) {
            console.log("Can't get data from API");
            alert(err.message);
        }
    }

    // Display front-card based on API data
    // ************************************
    function displayFrontCardFromApi(coins) {
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
    }

    // More-Information Btn handling
    // *****************************
    function backCardHandling(btnArray) {

        const coinId = getCoinId(btnArray);

        const currentClickTime = Date.now();

        if (clickTimes.has(coinId)) {
            const lastTimeClick = clickTimes.get(coinId);
            const timeDiff = currentClickTime - lastTimeClick;
            console.log(`time diff = ${timeDiff / 60000}`);

            if (timeDiff > timeForApiUpdate) {
                clickTimes.set(coinId, currentClickTime);
                getMoreInfoFromApi(coinId);
            } 
            else {
                displayBackCardFromLocalData(coinId);
            }

        } else {
            clickTimes.set(coinId, currentClickTime);
            getMoreInfoFromApi(coinId);
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
            const coin = { image, symbol, name };
            coinsFrontData.set(key, coin);
        }
    }

    // Display front-card via local data
    // *********************************
    function displayFrontDataFromLocalData(coinId) {
        if (coinsFrontData.has(coinId)) {
            const coin = coinsFrontData.get(coinId);
            const content = `
            <div class="coinIdentity">
                <span class="coinImage"><img src="${coin.image}"></span>
                <div class="coinInfo">
                    <span class="symbolSpan">${coin.symbol.toUpperCase()}</span>
                    <span class="symbolName">${coin.name}</span>
                </div>
                <div class="form-check form-switch">
                    <input id="${coinId}-toggle" class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                </div>
            </div>
            <span>
                <button id="${coinId}-infoBtn" class="infoBtn">More Information</button>
            </span>`;

            $(`#${coinId}`).html(content);

            // Set toggle if relevant
            const existsInLocalStorage = coinsArray.find((coin) => coin === coinId);
            if (existsInLocalStorage !== undefined) {
                const coinToggle = $(`#${coinId}-toggle`);
                coinToggle.prop("checked", true);
            }
        } 
        else {
            getMoreInfoFromApi(coinId);
        }

    }

    // Get back-card data from API
    // ****************************
    async function getMoreInfoFromApi(coinId) {
        try {
            loadSVG(coinId);
            const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
            const response = await axios.get(url);
            const coin = response.data;

            $(`#${coinId}`).html("");

            console.log("display price from API executed");

            displayMoreInfoCard(coin, coinId);
            saveCoinPrices(coin, coinId);
        } 
        catch (err) {
            console.log("Can't get data from API");
            alert(err.message);
            displayFrontDataFromLocalData(coinId);
        }

    }

    // Display back-card data based on API data
    // ****************************************
    function displayMoreInfoCard(coin, id) {
        const displayList = getUserDisplayList();
        const apiObj = "market_data.current_price";

        let content = `<span class="symbolSpanBack">${coin.symbol}</span>`;
        for (const item of displayList) {
            const symbol = priceSymbols.get(item);
            const path = `${apiObj}.${item}`;

            const keys = path.split(".");
            const apiData = keys.reduce((obj, key) => obj && obj[key], coin);

            content += `<span>${apiData} ${symbol}</span>`;
        }

        $(`#${id}`).html(`
        <div class="coinPrice">${content}</div>
        <span>
            <button id="${coin.id}-closeBtn" class="closeBtn">Close</button>
        </span> `);
    }

    // Save back-card data
    // ********************
    function saveCoinPrices(coin, coinId) {
        const eur = coin.market_data.current_price.eur;
        const usd = coin.market_data.current_price.usd;
        const ils = coin.market_data.current_price.ils;
        const coinPrice = { eur, usd, ils };

        coinsPrices.set(`${coinId}`, coinPrice);
    }

    // Display back-card via local data
    // *********************************
    function displayBackCardFromLocalData(coinId) {
        // Validation
        if (!coinsPrices.has(coinId)) {
            getMoreInfoFromApi(coinId);
            return;
        }

        // User choices
        const displayList = getUserDisplayList();

        // Get coin symbol
        const coin = coinsFrontData.get(coinId);
        const coinSymbol = coin.symbol;

        let content = `<span class="symbolSpanBack">${coinSymbol}</span>`;
        for (const item of displayList) {
            const symbol = priceSymbols.get(item);
            const pricesObj = coinsPrices.get(coinId);
            const price = pricesObj[item];

            content += `<span>${price} ${symbol}</span>`;
        }

        $(`#${coinId}`).html(`
            <div class="coinPrice">${content}</div>
                <span>
                    <button id="${coinId}-closeBtn" class="closeBtn">Close</button>
                </span>
        `);
    }

    // Modal Handling
    // **************
    function selectedCoinsHandling(toggle) {

        const toggleIsChecked = $(`#${toggle}`).prop("checked");
        const coinId = getCoinId(toggle);

        if (toggleIsChecked) {
            coinsArray.push(coinId);
        }
        else {
            for (let i = 0; i < coinsArray.length; i++) {
                if (coinsArray[i] === coinId)
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
    }

    function closeModal() {
        for (let i = coinsArray.length - 1; i >= 0; i--) {
            const currentCoin = coinsArray[i];
            const modalCheckbox = $(`#checkbox-${currentCoin}`);
            const value = modalCheckbox.prop("checked");

            if (value === true) {
                const toggle = $(`#${currentCoin}-toggle`);

                if (toggle !== null) {
                    toggle.prop("checked", false);
                }
                coinsArray.splice(i, 1);
            }
        }
        console.log("coinsArray after modal close:", coinsArray);

        saveInStorage();

        if (coinsArray.length > liveReportCapacity)
            $("#errorModalDiv").css("display", "flex");
        else {
            $("#capacityModal").css("display", "none");
            $("body").css("overflow", "");
        }
    }

    function cancelModal() {
        const lastIndex = coinsArray.length - 1;
        const lastSelection = coinsArray[lastIndex];
        $(`#${lastSelection}-toggle`).prop("checked", false);

        coinsArray.splice(lastIndex, 1);

        saveInStorage();

        $("#capacityModal").css("display", "none");
        $("body").css("overflow", "");
    }

    // --------------------------------------------------------------------------------------------------
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
            
            const backCardSymbol = $(this).find(".symbolSpanBack");
            const backCardSymbolText = backCardSymbol.text().toLowerCase();

            if (cardSymbolText.includes(userInput) || backCardSymbolText.includes(userInput)) {
                $(this).show();
                hasResults = true;
            } else {
                $(this).hide();
            }
        });

        //No result handling
        if (!hasResults) $("#noResultsContainer").css("display", "block");
        else  $("#noResultsContainer").css("display", "none"); 
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
            $(`#${coinsArray[i]}-toggle`).prop("checked", false);
        }

        coinsArray = [];
        saveInStorage();
    });

    async function loadSVG(coinId) {
        const url = "assets/svg/spinner_svg.svg";
        const response = await axios.get(url);
        const svg = response.data;
        // Set SVG to specific card
        $(`#${coinId}`).html(`${svg}`);

        // SVG CSS to make sure its inside the card
        const svgElement = $(`#${coinId}`).find("svg");
        svgElement.css({
            "max-width": "100%",
            "max-height": "100%",
            display: "block",
            margin: "auto",
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
        for (const item of coinsArray) {
            $(`#${item}-toggle`).prop("checked", true);
        }
    }

    $("#liveReportsLink").on("click", () => {

        // Check if already exist
        if (localStorage.getItem("symbolsString"))
            localStorage.removeItem("symbolsString");

        // Create new local data
        const length = coinsArray.length;
        if (length === 0) return;
        
        let string = "";
        let counter = 0;
        for (const item of coinsArray) {
            counter++;
            const coinObj = coinsFrontData.get(item);
            const coinSymbol = coinObj.symbol;

            if (counter === length) 
                string += `${coinSymbol}`;
            else 
                string += `${coinSymbol},`;
        }

        const saveString = string.toUpperCase();

        const json = JSON.stringify(saveString);
        localStorage.setItem("symbolsString", json);
    });


})();