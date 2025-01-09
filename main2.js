/// <reference path="jquery-3.7.1.js"/>
"use strict";


// Parallax Animation 
// ******************
$(window).scroll(() => {
    const scrollPositionY = $(window).scrollTop();
    const speed = 0.4;
    $(".parallaxImage").css("transform", `translate3d(0, ${scrollPositionY * speed}px, 0)`);

    const backgroundHeight = $(".parallaxBg").outerHeight();
    if (backgroundHeight <= scrollPositionY)
        $("nav a").css("color", "black");
    else
        $("nav a").css("color", "#d9d9d9");
});


// Get Data from local storage
const symbolsString = JSON.parse(localStorage.getItem('symbolsString'));
console.log(typeof symbolsString);

// Create string for chart'a subtitle
const splitted = symbolsString.split(",");
const subtitle = splitted.join(", ");

// Create Static Data for chart
let coinDataPoints = {};

function getDataArray() {

    const dataArray = [];
    const coins = subtitle.split(", ");

    for (const coin of coins) {
        coinDataPoints[coin] = [];

        const obj = {
            type: "spline",
            name: coin,
            showInLegend: true,
            xValueFormatString: "hh:mm:ss TT",
            yValueFormatString: "$#,##0.#",
            dataPoints: coinDataPoints[coin]
        };

        dataArray.push(obj);
    }

    // console.log(dataArray);
    return dataArray;
}


function getDataFromApi() {
    setInterval(async function () {
        try {
            const apiKey = "de74120914e79001714c5592aac92671b8bacbf2f50377763b1e657b292277d8";
            const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolsString}&tsyms=USD&api_key=${apiKey}`;
            const response = await axios.get(url);
            const pricesObj = response.data;

            // console.log("Data received from API: ", pricesObj);

            updateChartData(pricesObj);
        }
        catch(err) {
            console.log("Can't get data from API");
            alert(err.message);
        }
    }, 2000);
}

// Update Chart 
function updateChartData(pricesObj) {
    for (const coin in pricesObj) {

        if (coinDataPoints[coin]) {

            const yValue = pricesObj[coin].USD;
            const currentTime = new Date();

            coinDataPoints[coin].push({
                x: currentTime,
                y: yValue
            });

            // Handling up to 100 points 
            if (coinDataPoints[coin].length > 100) {
                coinDataPoints[coin].shift();
            }
        }
    }
    // console.log("Data points for all coins:", coinDataPoints);

    chart.render();
}



// JQuery`s function 
let chart;
window.onload = function () {
    const dataArray = getDataArray();

    const options = {
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: "Coins Live Reports"
        },
        subtitles: [{
            text: subtitle
        }],
        axisX: {
            title: "Time"
        },
        axisY: {
            title: "Values",
            titleFontColor: "#4F81BC",
            lineColor: "#4F81BC",
            labelFontColor: "#4F81BC",
            tickColor: "#4F81BC",
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
        },
        data: dataArray
    };

    // Chart creation
    chart = $("#chartContainer").CanvasJSChart(options).CanvasJSChart();


    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }

    // Set data 
    getDataFromApi();
}
