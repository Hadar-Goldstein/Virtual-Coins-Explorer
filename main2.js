/// <reference path="jquery-3.7.1.js"/>
"use strict";


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


// Get Local Storage data
// **********************
const selectedCoinsIds = JSON.parse(localStorage.getItem('selectedCoins'));
console.log(selectedCoinsIds);

const symbolsString = JSON.parse(localStorage.getItem('symbolsString'));
console.log(typeof symbolsString);

const splitted = symbolsString.split(",");
const subtitle = splitted.join(", ");
console.log(subtitle);


function getDataArray() {
    const dataArray = [];
    const coins = subtitle.split(", "); 

    for (const coin of coins) {
        const obj = {
            type: "spline",
            name: coin,
            showInLegend: true,
            xValueFormatString: "hh:mm:ss TT",
            yValueFormatString: "$#,##0.#",
            dataPoints: []
        };
        dataArray.push(obj);
    }
    return dataArray;
}

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
  
  
function getDataFromApi() {
    setInterval(async function () {
    const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolsString}&tsyms=USD`;
    const response = await axios.get(url);
    const pricesObj = response.data;
    // updateGraphData(pricesObj);

    // console.log(pricesObj);
    }, 2000);

}
function updateGraphData(pricesObj) {

    for(const coin in pricesObj) {
        const yValue = pricesObj[coin].USD;
        const series = chart.options.data.find(series => series.name === coin);
        if (series) {
            series.dataPoints.push({ x: formattedTime, y: yValue });
        }
    }
    chart.render(); 
}



window.onload = function () {

    const dataArray = getDataArray();
    
    var options = {
        exportEnabled: true,
        animationEnabled: true,
        title:{
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
    $("#chartContainer").CanvasJSChart(options);
    
    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
    }
