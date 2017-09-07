using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Options.Services
{
    public interface IUrlService
    {
         string HistoricalPricesUrl(string identifier, string start_date, string end_date, string frequency);

        string StatementUrl(string identifier, string statement, string type, string fiscalYear);

        string Report10KUrl(string identifier);
    }
}
