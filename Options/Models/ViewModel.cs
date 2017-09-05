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
        public List<Dictionary<int, Dictionary<string, string>>> Statements { get; set; }

        public string JsonHistoricalPrices { get; set; }

        public void SetJsonStrings()
        {
            JsonHistoricalPrices = JsonConvert.SerializeObject(HistoricalLowPrices);
        }
    }
}
