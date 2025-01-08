"use strict";

// הגדרת משתנים
let chart;
let coinDataPoints = {}; // מגדיר coinDataPoints מחוץ לפונקציות

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

// קבלת נתונים מה-localStorage
const selectedCoinsIds = JSON.parse(localStorage.getItem('selectedCoins'));
console.log(selectedCoinsIds);

const symbolsString = JSON.parse(localStorage.getItem('symbolsString'));
console.log(typeof symbolsString);

const splitted = symbolsString.split(",");
const subtitle = splitted.join(", ");
console.log(subtitle);

// פונקציה להחזרת מערך הנתונים
function getDataArray() {
    const dataArray = [];
    const coins = subtitle.split(", ");

    for (const coin of coins) {
        // צור מערך dataPoints עבור כל מטבע
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
    console.log(dataArray);
    return dataArray;
}

// פונקציה לקבלת הזמן הנוכחי
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    hours = hours.toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds} ${amPm}`;
}

// פונקציה לקבלת נתונים מה-API
function getDataFromApi() {
    setInterval(async function () {
        const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolsString}&tsyms=USD`;
        const response = await axios.get(url);
        const pricesObj = response.data;
        console.log("Data received from API: ", pricesObj);
        updateGraphData(pricesObj);
    }, 2000);
}

// פונקציה לעדכון נתוני הגרף
function updateGraphData(pricesObj) {
    for (const coin in pricesObj) {
        if (coinDataPoints[coin]) {
            const yValue = pricesObj[coin].USD;
            const currentTime = new Date();
            // הוסף את הנתונים ל־dataPoints של המטבע המתאים
            coinDataPoints[coin].push({
                x: currentTime,
                y: yValue
            });
            console.log(`Updated ${coin}: ${yValue} at ${currentTime}`);
        }
    }


    $("#chartContainer").CanvasJSChart().render();
    
}

// פונקציה אשר קוראת כאשר הדף נטען
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
            tickColor: "#4F81BC"
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

    // יצירת הגרף
    chart = $("#chartContainer").CanvasJSChart(options);

    // פונקציה לניהול הצגת/הסתרת סדרות נתונים
    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }

    // אתחול קריאת הנתונים מה-API
    getDataFromApi();
}
