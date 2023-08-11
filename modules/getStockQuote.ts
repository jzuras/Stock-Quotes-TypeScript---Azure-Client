import * as z from 'https://cdn.skypack.dev/superstruct';

//#region Superstruct Object Definitions:

export const StockDataSchema = z.object( {
    "companySymbol": z.string(),
    "companyName": z.string(),
    "quote": z.number(),
    "timeOfQuote": z.string(),
} );
export type StockData = z.Infer<typeof StockDataSchema>;

export const ErrorDataSchema = z.object( {
    "code": z.number(),
    "message": z.string(),
    "status": z.string(),
} );
export type ErrorData = z.Infer<typeof ErrorDataSchema>;

export const ReturnedStockDataSchema = z.object( {
    "stockData": StockDataSchema,
    "errorData": ErrorDataSchema,
    "error": z.boolean(),
} );
export type ReturnedStockData = z.Infer<typeof ReturnedStockDataSchema>;

//#endregion


/** 
 * Calls the Azure Function to get a price quote.
 * @param symbolToUse - Ticker symbol for which to get data.
 * @return ReturnedStockData Promise, which includes either data or error info.
 */
export async function getStockQuote( symbolToUse : string )
{
    try 
    {
        // local URL to testing purposes - need to run serer as func host start --cors *
//        const apiURL: string = 'http://localhost:7071/api/GetStockQuote?symbol=';
        const apiURL = 'https://stockquotes-jcz-c-sharp.azurewebsites.net/api/GetStockQuote?symbol=';

        const apiString = apiURL + encodeURI( symbolToUse );
        const response = await fetch( apiString );

        if ( !response.ok ) 
        {
            throw new Error( `HTTP error: ${response.status}` );
        }
      
        let responseText = await response.text();

        // this assert will throw an error if the responseText is not the correct shape
        z.assert( JSON.parse( responseText ), ReturnedStockDataSchema );

        return ( JSON.parse( responseText ) );
    }
    catch ( error )
    {
        if ( error instanceof z.StructError )
        {
            console.log( error.message );
        }
        throw error;
    }
}
