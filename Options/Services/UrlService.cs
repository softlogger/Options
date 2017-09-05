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
    }
}
