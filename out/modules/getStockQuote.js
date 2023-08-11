var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as z from 'https://cdn.skypack.dev/superstruct';
//#region Superstruct Object Definitions:
export const StockDataSchema = z.object({
    "companySymbol": z.string(),
    "companyName": z.string(),
    "quote": z.number(),
    "timeOfQuote": z.string(),
});
export const ErrorDataSchema = z.object({
    "code": z.number(),
    "message": z.string(),
    "status": z.string(),
});
export const ReturnedStockDataSchema = z.object({
    "stockData": StockDataSchema,
    "errorData": ErrorDataSchema,
    "error": z.boolean(),
});
//#endregion
/**
 * Calls the Azure Function to get a price quote.
 * @param symbolToUse - Ticker symbol for which to get data.
 * @return ReturnedStockData Promise, which includes either data or error info.
 */
export function getStockQuote(symbolToUse) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // local URL to testing purposes - need to run serer as func host start --cors *
            //        const apiURL: string = 'http://localhost:7071/api/GetStockQuote?symbol=';
            const apiURL = 'https://stockquotes-jcz-c-sharp.azurewebsites.net/api/GetStockQuote?symbol=';
            const apiString = apiURL + encodeURI(symbolToUse);
            const response = yield fetch(apiString);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let responseText = yield response.text();
            // this assert will throw an error if the responseText is not the correct shape
            z.assert(JSON.parse(responseText), ReturnedStockDataSchema);
            return (JSON.parse(responseText));
        }
        catch (error) {
            if (error instanceof z.StructError) {
                console.log(error.message);
            }
            throw error;
        }
    });
}
//# sourceMappingURL=getStockQuote.js.map