using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Options.Models;
using Newtonsoft.Json;

namespace Options.Services
{
    public class IntrinioService : IIntrinioService
    {
        INetService _netService;
        IUrlService _urlService;
        public IntrinioService(IUrlService urlService, INetService netService)
        {
            _urlService = urlService;
            _netService = netService;
            
        }

        

        public Dictionary<int, string> GetHistoricalLowPrices(string ticker)
        {
            string endDate = DateTime.Now.ToString("yyyy-MM-dd");
            string startDate = (new DateTime(DateTime.Now.Year - 3, 01, 01)).ToString("yyyy-MM-dd");
            string identifier = ticker;
            string frequency = "monthly";

            string url = _urlService.HistoricalPricesUrl(identifier, startDate, endDate, frequency);

            string responseString = _netService.GetResponseFor(url);

            HistoricalPrices historicalPrices = JsonConvert.DeserializeObject<HistoricalPrices>(responseString);

            var historicalData = historicalPrices.data;

            var years = historicalData.Select(y => DateTime.Parse(y.date).Year).Distinct().ToList();

            Dictionary<int, string> leastPricePerYear = new Dictionary<int, string>();

            foreach (var y in years)
            {
                var leastPrice = historicalData.Where(h => DateTime.Parse(h.date).Year == y).Select(p => Convert.ToDecimal(p.low)).Min().ToString();

                var leastPriceDate = historicalData.Where(h => DateTime.Parse(h.date).Year == y).Where(p => p.low == leastPrice).First();

                leastPricePerYear.Add(y, leastPrice + "  " + leastPriceDate.date);
            }

            // var dictSTring = JsonConvert.SerializeObject(leastPricePerYear);

            // { "2017":26.96,"2016":38.605,"2015":47.73,"2014":54.96}
            return leastPricePerYear;

        }

        public List<Dictionary<int, Dictionary<string, string>>> GetStatements(string ticker)
        {
            throw new NotImplementedException();
        }
    }
}
