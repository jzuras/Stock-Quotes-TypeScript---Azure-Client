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
export const StockDatumSchema = z.object({
    "x": z.string(),
    "y": z.number(),
});
export const ErrorDataSchema = z.object({
    "code": z.number(),
    "message": z.string(),
    "status": z.string(),
});
export const TwelveDataTimeSeriesSchema = z.object({
    "stockData": z.array(StockDatumSchema),
    "errorData": ErrorDataSchema,
    "error": z.boolean(),
});
//#endregion
/**
 * Calls the Azure Function to get an array of price quotes for
 * the most recent day that the stock market was open.
 * @param symbolToUse - Ticker symbol for which to get data.
 * @returns TimeSeriesStockData Promise, which includes either data or error info.
 */
export function getTimeSeries(symbolToUse) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // local URL to testing purposes - need to run serer as func host start --cors *
            //        const apiURL: string = 'http://localhost:7071/api/GetTimeSeries?symbol=';
            const apiURL = 'https://stockquotes-jcz-c-sharp.azurewebsites.net/api/GetTimeSeries?symbol=';
            const apiString = apiURL + encodeURI(symbolToUse);
            const response = yield fetch(apiString);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let responseText = yield response.text();
            // this assert will throw an error if the responseText is not the correct shape
            z.assert(JSON.parse(responseText), TwelveDataTimeSeriesSchema);
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
//# sourceMappingURL=getTimeSeriesQuote.js.map