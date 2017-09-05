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

        public Dictionary<int, string> HistoricalLowPrices { get; set; }
        public Dictionary<int, Dictionary<string, Dictionary<string,string>>> Statements { get; set; }

        public Dictionary<int, string> FiscalYears { get; set; }

        public string JsonHistoricalPrices { get; set; }

        public string JsonStatements { get; set; }

        public string JsonFiscalYears { get; set; }

        public void SetJsonStrings()
        {
            JsonHistoricalPrices = JsonConvert.SerializeObject(HistoricalLowPrices);
            JsonStatements = JsonConvert.SerializeObject(Statements);
            JsonFiscalYears = JsonConvert.SerializeObject(FiscalYears);
        }
    }
}
