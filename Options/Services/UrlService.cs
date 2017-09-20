using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Options.Services
{
    public class UrlService : IUrlService
    {
        private string IntrinioBase()
        {
            return @"https://api.intrinio.com/";
        }
        public string HistoricalPricesUrl(string identifier, string start_date, string end_date, string frequency)
        {
            // @"https://api.intrinio.com/prices?identifier=BBBY&start_date=2014-01-01&end_date=2017-09-03&frequency=monthly";


            return string.Format($"https://api.intrinio.com/prices?identifier={identifier}&start_date={start_date}&end_date={end_date}&frequency={frequency}");
        }

        // @"https://api.intrinio.com/financials/standardized?identifier=BBBY&statement=income_statement&type=FY&fiscal_year=2016";
        public string StatementUrl(string identifier, string statement, string type, string fiscalYear)
        {
            return $"https://api.intrinio.com/financials/standardized?identifier={identifier}&statement={statement}&type={type}&fiscal_year={fiscalYear}";
        }

        public string Report10KUrl(string identifier)
        {
            var startDate = new DateTime(DateTime.Now.Year - 1, 1, 1).ToString("yyyy-MM-dd");

            return $"https://api.intrinio.com/companies/filings?identifier={identifier}&report_type=10-K&start_date={startDate}";
        }

        public string GetDividend(string identifer)
        {
            return $"https://api.intrinio.com/historical_data?identifier={identifer}&item=dividend";
        }
    }
}
