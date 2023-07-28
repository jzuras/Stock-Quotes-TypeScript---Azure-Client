import * as z from 'https://cdn.skypack.dev/zod@3.5.1';

//#region Zod Object Definitions:

export const StockDataSchema = z.object( {
    "companySymbol": z.string(),
    "companyName": z.string(),
    "quote": z.number(),
    "timeOfQuote": z.string(),
} );
export type StockData = z.infer<typeof StockDataSchema>;

export const ErrorDataSchema = z.object( {
    "code": z.number(),
    "message": z.string(),
    "status": z.string(),
} );
export type ErrorData = z.infer<typeof ErrorDataSchema>;

export const ReturnedStockDataSchema = z.object( {
    "stockData": StockDataSchema,
    "errorData": ErrorDataSchema,
    "error": z.boolean(),
} );
export type ReturnedStockData = z.infer<typeof ReturnedStockDataSchema>;

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
        return ( ReturnedStockDataSchema.parse( JSON.parse( responseText ) ) );
    }
    catch ( error )
    {
        if ( error instanceof z.ZodError )
        {
            console.log( error.issues );
        }
        throw error;
    }
}
