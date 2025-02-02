"use strict";

(() => {
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

    // --------------------------------------------------------------------------------------------------

    // Get Data from local storage
    const symbolsString = JSON.parse(localStorage.getItem('symbolsString'));
    let errorLogic = false;

    if (symbolsString === null) errorLogic = true;
    else if (symbolsString.length === 0) errorLogic = true;

    if (errorLogic) {
        alert("Live Report can't be displayed because no coins were selected");
        $(document).ready(function () {
            let previousPage = document.referrer;

            if (previousPage)
                window.location.href = previousPage;
            else
                window.location.href = "index.html";
        });
    }

    // Create string for chart's subtitle
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

        return dataArray;
    }

    function getDataFromApi() {
        setInterval(async function () {
            try {
                const apiKey = "de74120914e79001714c5592aac92671b8bacbf2f50377763b1e657b292277d8";
                const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolsString}&tsyms=USD&api_key=${apiKey}`;
                const response = await axios.get(url);
                const pricesObj = response.data;

                updateChartData(pricesObj);
            }
            catch (err) {
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

        chart.render();
    }

    // JQuery`s function 
    let chart;

    $(window).on("load", function () {
        const dataArray = getDataArray();

        const options = {
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
    });
})();