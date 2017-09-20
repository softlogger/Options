using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Options.Models
{
    public class ViewModel
    {
        public TickerContainer TickerContainer { get; set; }

        public string Report10KUrl { get; set; }

     //   public Dictionary<int, string> HistoricalLowPrices { get; set; }
        public Dictionary<int, Dictionary<string, Dictionary<string, string>>> Statements { get; set; }

        public Dictionary<int, string> FiscalYears { get; set; }

        public Dictionary<int, string> HistoricalLowPrices { get; set; }

        public string JsonHistoricalPrices { get; set; }

        public string JsonStatements { get; set; }

        public string JsonFiscalYears { get; set; }

        public string JsonStatementColoumnHeaders { get; set; }

        public List<List<string>> StatementTable { get; set; }

        public string JsonStatementTable { get; set; }

        public string JsonDividendInfo { get; set; }
        public void SetJsonStrings()
        {
            JsonFiscalYears = JsonConvert.SerializeObject(FiscalYears);
            JsonStatementTable = JsonConvert.SerializeObject(StatementTable);
            JsonHistoricalPrices = JsonConvert.SerializeObject(HistoricalLowPrices);
        }
    }
}
