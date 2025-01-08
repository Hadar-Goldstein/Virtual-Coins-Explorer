// Get Local Storage data
// **********************
const selectedCoinsIds = JSON.parse(localStorage.getItem('selectedCoins'));
console.log(selectedCoinsIds);

const symbolsString = JSON.parse(localStorage.getItem('symbolsString'));
console.log(symbolsString);

async function getDataFromApi() {
    const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolsString}&tsyms=USD`;
    const response = await axios.get(url);
    const pricesObj = response.data;
    return pricesObj;
}


