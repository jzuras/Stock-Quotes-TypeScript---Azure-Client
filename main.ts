//#region imports
import { getStockQuote, StockData } from './modules/getStockQuote.js';
import { getTimeSeries } from './modules/getTimeSeriesQuote.js';
import { drawChart } from './modules/stockChart.js';
//#endregion


//#region HTML elements:
//const divStockSymbol
//    = document.querySelector( '#divStockSymbol' ) as HTMLDivElement;
const inputStockSymbol
    = document.querySelector( '#inputStockSymbol' ) as HTMLInputElement;
const btnGetQuote
    = document.querySelector( '#btnGetQuote' ) as HTMLButtonElement;
const tblQuotes
    = document.querySelector( '#tblQuotes' ) as HTMLTableElement;
const tbodyQuotes
    = document.querySelector( '#tbodyQuotes' ) as HTMLTableSectionElement;
const form
    = document.querySelector( '#frmQuotes' ) as HTMLFormElement;
const divChart
    = document.querySelector( '#divChart' ) as HTMLDivElement;
const canvasChart
    = document.getElementById( 'stockChart' ) as HTMLCanvasElement;
const lblCurrentChartSymbol
    = document.querySelector( '#lblCurrentChartSymbol' ) as HTMLLabelElement;
//#endregion


//#region constant values
const refreshButtonText: string = 'Refresh 3 times';
const refreshButtonID: string = 'refreshButton';
const refreshInterval: number = 10000; // API has limit of 8 calls/min
const refreshMaxTimes: number = 3;
const symbolColumnIndex: number = 0; // "company name" column is this + 1
const quoteColumnIndex: number = 2; // "time of quote" column is this + 1
//#endregion


//#region non constant variables:
// mapping stock symbol to interval/refresh number and counter
type refreshMapValue = { intervalID: number, refreshCounter: number };

// map key is company symbol, value is object of type refreshMapValue
let refreshMap = new Map<string, refreshMapValue>();

// used to determine if chart should be hidden
// (when company being shown is deleted from table)
let symbolInChart = '';
//#endregion


//#region Initialization code:
// Stop the form from submitting when a button is pressed
form.addEventListener( 'submit', ( e ) => e.preventDefault() );

btnGetQuote.addEventListener( 'click', getQuoteButtonClick );

// set chart dimensions
canvasChart.width = window.innerWidth - 50;
canvasChart.height = 500;

// restrict stock symbol to valid characters only
const regex = new RegExp( "^[a-zA-Z.]*$" );
inputStockSymbol.addEventListener( 'beforeinput', ( event ) =>
{
    if ( event.data != null && !regex.test( event.data ) )
        event.preventDefault();
} );
//#endregion


//#region functions:
/**
 * Attempts to get a recent price quote for the symbol in the text box,
 * adding it to the HTML table of quotes (done via addRow method).
 * Also clears out the text box and gives it focus.
 */
function getQuoteButtonClick() 
{
    const stockSymbol = inputStockSymbol.value;
    inputStockSymbol.value = '';

    if ( !stockSymbol )
    {
        inputStockSymbol.focus();
        return;
    }

    const companyStockDataPromise =
        getStockQuote( stockSymbol );
    companyStockDataPromise
        .then( ( data ) =>
        {
            if ( data.error == false ) addRow( data.stockData );
            else
            {
                window.alert( data.errorData.message );   
            }
        } )
        .catch( ( error ) =>
        {
            window.alert( error );
        } )

    inputStockSymbol.focus();
};


/**
 * Transforms the given date into a local format, such as "7/28/2023, 12:13:44 PM".
 * @param dateString Date in any format accepted by JS Date type.
 * @returns Date in a local format, as a string.
 */
function toLocalFormat ( dateString: string ): string
{
    try
    {
        const tmpDate: Date = new Date( dateString );
        return tmpDate.toLocaleString();
    }
    catch
    {
        // just return original string if we have an issue with transforming it
        return dateString;
    }

}


/**
 * Dynamically adds a row to the given HTML Table using the StockData data.
 * Row will also include buttons to show in chart, start a timer (which only
 * refreshes a few times to save API calls), and to delete the row.
 * @param data - A StockData object used to populate the row.
 */
function addRow( data: StockData ) 
{
    // first few columns in table are:
    // ticker, company name, price, time of quote
    let row = tbodyQuotes.insertRow();
    let cell = row.insertCell();
    let text = document.createTextNode( data.companySymbol );
    cell.appendChild( text );
    cell = row.insertCell();
    text = document.createTextNode( data.companyName );
    cell.appendChild( text );
    cell = row.insertCell();
    text = document.createTextNode( data.quote.toFixed(2).toString() );
    cell.appendChild( text );
    cell = row.insertCell();
    text = document.createTextNode( toLocalFormat( data.timeOfQuote ) );
    cell.appendChild( text );

    // add button to chart prices for this company
    const showInChartBtn = document.createElement( 'button' );
    showInChartBtn.textContent = 'Chart';
    cell = row.insertCell();
    cell.appendChild( showInChartBtn );
    showInChartBtn.addEventListener( 'click', () =>
    {
        showInChartButtonClick( row );
    } );

    // add button to refresh quote (only a few times
    // so as not to use too many API calls)
    const refreshBtn = document.createElement( 'button' );
    refreshBtn.textContent = refreshButtonText;
    refreshBtn.id = refreshButtonID;
    cell = row.insertCell();
    cell.appendChild( refreshBtn );
    refreshBtn.addEventListener( 'click', () =>
    {
        refreshRowButtonClick( row );
    } );

    // add button to delete current row
    const listBtn = document.createElement( 'button' );
    listBtn.textContent = 'Delete';
    cell = row.insertCell();
    cell.appendChild( listBtn );
    listBtn.addEventListener( 'click', () =>
    {
        deleteRowButtonClick( row );
    } );

    tblQuotes.style.display = 'block';
}


/**
 * Deletes the row from the parent HTML Table.
 * Hides table if this was the last row in the table.
*  Will also hide chart if deleted row was for the same stock symbol as chart.
 * @param row - The row to be deleted.
 */
function deleteRowButtonClick( row: HTMLTableRowElement ) 
{
    const tmpSymbol =
        ( ( row.childNodes[symbolColumnIndex] ) as HTMLTableSectionElement ).innerText;
    if ( tmpSymbol === symbolInChart )
    {
        symbolInChart = '';
        divChart.style.display = 'none';
    }

    // if last row in table, hide table
    if ( ( ( row.parentNode! ) as HTMLTableSectionElement ).rows.length === 1 )
    {
        tblQuotes.style.display = 'none';
    }

    row.parentNode!.removeChild( row );
}


/**
 * Handles updating the stock price, as well as the text on the 
 * refresh button to count the refreshes. Button is disabled until timer stops.
 * If refresh counter hits limit, button text is reset, button is enabled,
 * and timer is canceled.
 * @param row - The row to be refreshed.
 */
function refreshQuote( row: HTMLTableRowElement )
{
    const refreshButton =
        row.querySelector( '#' + refreshButtonID ) as HTMLButtonElement;
    const stockSymbol =
        ( ( row.childNodes[symbolColumnIndex] ) as HTMLTableSectionElement ).innerText;

    let mapValue = refreshMap.get( stockSymbol ) as refreshMapValue;
    if ( mapValue.refreshCounter++ === refreshMaxTimes - 1 )
    {
        // stop future refreshes, reset button text and re-enable it
        mapValue.refreshCounter = 0;
        clearInterval( mapValue.intervalID ); // no more refreshes after this one
        refreshButton.textContent = refreshButtonText;
        refreshButton.disabled = false;
    }
    else
    {
        // update button text and disable if needed
        refreshButton.textContent = 'Refresh #' + mapValue.refreshCounter;
        if ( mapValue.refreshCounter === 1 ) refreshButton.disabled = true;
    }

    const companyDataPromise = getStockQuote( stockSymbol );
    companyDataPromise
        .then( ( data ) =>
        {
            if ( data.error == false ) updateRow( row, data.stockData );
            else
            {
                window.alert( data.errorData.message );
            }
        } )
        .catch( ( error ) =>
        {
            window.alert( error );
        } )
}


/**
 * Sets a timer for periodic refreshes of the stock price,
 * but also does an immediate refresh as refresh #1.
 * @param row - The row to be refreshed.
 */
function refreshRowButtonClick( row: HTMLTableRowElement )
{
    // Mapping stock symbol to timer ID and counter (used to stop timer).
    // This allows multiple refreshes for different companies 
    // to be happening simultaneously.

    const stockSymbol =
        ( ( row.childNodes[symbolColumnIndex] ) as HTMLTableSectionElement ).innerText;
    const intID = setInterval( refreshQuote, refreshInterval, row );
    let mapValue = { intervalID: intID, refreshCounter: 0 };
    refreshMap.set( stockSymbol, mapValue );
    refreshQuote( row );
}


/**
 * Updates the text in the row with the new price quote and time.
 * @param row - The row to be refreshed.
 * @param data - StockData object used in the update.
 */
function updateRow( row: HTMLTableRowElement, data: StockData )
{
    ( ( row.childNodes[quoteColumnIndex] ) as HTMLTableSectionElement ).innerText =
        data.quote.toFixed(2).toString();
    ( ( row.childNodes[quoteColumnIndex + 1] ) as HTMLTableSectionElement ).innerText =
        toLocalFormat( data.timeOfQuote );
}


/**
 * Makes chart visible, updates label indicating current stock symbol
 * being charted, fetches daily price values, and draws the chart itself.
 * @param row - The row to be charted.
 */
function showInChartButtonClick( row: HTMLTableRowElement )
{
    divChart.style.display = 'block';

    symbolInChart =
        ( ( row.childNodes[symbolColumnIndex] ) as HTMLTableSectionElement ).innerText;

    lblCurrentChartSymbol.innerHTML = ' for ' + encodeURI( symbolInChart );

    const companyStockDataPromise =
        getTimeSeries( symbolInChart );
    companyStockDataPromise
        .then( ( data ) => 
        {
            if ( data.error == false ) drawChart( canvasChart, data.stockData );
            else
            {
                divChart.style.display = 'none';

                // wrapping window.alert() to allow browser to update (hide chart)
                // before alerting the user - maybe not the best way to do this?
                window.requestAnimationFrame( () => 
                {
                    window.requestAnimationFrame( () => window.alert( data.errorData.message ) );
                } )
            }
        } )
        .catch( ( error ) =>
        {
            divChart.style.display = 'none';

            // wrapping window.alert() to allow browser to update (hide chart)
            // before alerting the user - maybe not the best way to do this?
            window.requestAnimationFrame( () => 
            {
                window.requestAnimationFrame( () => window.alert( error ) )
            } )
        } )
}

//#endregion
