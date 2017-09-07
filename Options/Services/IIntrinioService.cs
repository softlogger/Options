using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Options.Services
{
    public interface IIntrinioService
    {
        //get fiscal years 
        //get historical low prices
        //get income statement
        //get balance sheet
        //get cash flow statement
        //get calculation statement

        //dictionary<year<dictionary<tag, value>>

        /*2016 - end-date 2/25/2017
                 cal low-price $$ (2017 calender year??)
                 fiscal period low-price $$ (price since end of fiscal period)
                 EBIT
                 EBIT + Non Recurring exp
                 Int exp
                 Dep
                 Taxes
                 *C*EBITDA (mine)
                 Dil. Shares outstanding
                 Total Liabilities
                 Total Current Assets

                 *C*(Liab - current Assets)/Outstanding shares
                 *C* (EBIDTA/est Rev) {identify if dividend paid)
                 *C* Buying Price = (Stock price - Premium) + (Diff in Liab and Ass)
                 *C* Projected EBIDTA/Projected # no. shares
                 *C* CFM = A/B lower the better
        */

        Dictionary<int, string> GetHistoricalLowPrices(string ticker);

        Dictionary<int, Dictionary<string, Dictionary<string, string>>> GetStatements(string ticker, Dictionary<int, string> fiscalYears);

        Dictionary<int, string> GetFiscalYears(string ticker);

        string GetReport10KUrl(string ticker);

        List<List<string>> GetStatementsTable(Dictionary<int, Dictionary<string, Dictionary<string, string>>> statements);
       

    }
}
