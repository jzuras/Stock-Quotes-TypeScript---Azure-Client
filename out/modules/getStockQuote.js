var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as z from 'https://cdn.skypack.dev/zod@3.5.1';
//#region Zod Object Definitions:
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
export function getStockQuote(symbolToUse, useRealTime) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // local URL for testing purposes - need to run serer as func host start --cors *
            //        const apiURL: string = 'http://localhost:7071/api/GetStockQuote?symbol=';
            const apiURL = 'https://stockquotes-jcz-c-sharp.azurewebsites.net/api/GetStockQuote?symbol=';
            let apiString = apiURL + encodeURI(symbolToUse);
            if (useRealTime)
                apiString += '&realtime=1';
            const response = yield fetch(apiString);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let responseText = yield response.text();
            return (ReturnedStockDataSchema.parse(JSON.parse(responseText)));
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                console.log(error.issues);
            }
            throw error;
        }
    });
}
//# sourceMappingURL=getStockQuote.js.map