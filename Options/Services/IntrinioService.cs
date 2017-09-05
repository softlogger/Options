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
        List<string> STATEMENTS = new List<string>()
        {
            "income_statement",
            "balance_sheet",
            "calculations",
            "cash_flow"
        };

        string FISCAL_YEAR = "FY";


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

       public Dictionary<int, string> GetFiscalYears(string ticker)
        {
            string todaysDate = DateTime.Now.ToString("yyyy-MM-dd");

            string url = $"https://api.intrinio.com/fundamentals/standardized?identifier={ticker}&statement=income_statement&type=FY&date={todaysDate}";

            string responseString = _netService.GetResponseFor(url);

            StandardizedFinancial standardizedFinancial = JsonConvert.DeserializeObject<StandardizedFinancial>(responseString);

            Dictionary<int, string> fiscalYears = standardizedFinancial.data.Take(3).Select(d => new { d.fiscal_year, d.end_date }).ToDictionary(t => t.fiscal_year, t => t.end_date);

            return fiscalYears;
        }

        public Dictionary<int, Dictionary<string, Dictionary<string,string>>> GetStatements(string ticker, Dictionary<int, string> fiscalYears)
        {

            Dictionary<int, Dictionary<string, Dictionary<string,string>>> Dict = new Dictionary<int, Dictionary<string, Dictionary<string,string>>>();

            foreach(var sf in fiscalYears.Keys)
            {
                var year = sf;

                var statementDictionary = new Dictionary<string, Dictionary<string,string>>();

                foreach(var statement in STATEMENTS)
                {
                    var resp = responseStringFor(ticker, statement, FISCAL_YEAR, year.ToString());
                    resp.Add("end_date", fiscalYears[sf]);
                    statementDictionary.Add(statement, resp);
                }

                Dict.Add(sf, statementDictionary);
            }

            return Dict;
        }

        public Dictionary<string, string> responseStringFor(string ticker, string statement, string type, string fiscalYear)
        {
            string url = _urlService.StatementUrl(ticker, statement, type, fiscalYear);

            string response = _netService.GetResponseFor(url);

            Dictionary<string,string> filteredResponse = Filter(statement, response);

            return filteredResponse;
        }

        public Dictionary<string, string> Filter(string statement, string response)
        {
            Dictionary<string, string> tagValueDictionary = new Dictionary<string, string>();

            switch (statement)
            {
                case "income_statement":
                    IncomeStatement incomeStatement = JsonConvert.DeserializeObject<IncomeStatement>(response);
                    foreach(var i in incomeStatement.data)
                    {
                        tagValueDictionary.Add(i.tag, i.value);
                    }
                    break;
                case "balance_sheet":
                    BalanceSheet balance_sheet = JsonConvert.DeserializeObject<BalanceSheet>(response);
                    foreach (var i in balance_sheet.data)
                    {
                        tagValueDictionary.Add(i.tag, i.value);
                    }
                    break;
                case "calculations":
                    Calculation calculations = JsonConvert.DeserializeObject<Calculation>(response);
                    foreach (var i in calculations.data)
                    {
                        tagValueDictionary.Add(i.tag, i.Value);
                    }
                    break;
                case "cash_flow":
                    CashFlow cash_flow = JsonConvert.DeserializeObject<CashFlow>(response);
                    foreach (var i in cash_flow.data)
                    {
                        tagValueDictionary.Add(i.tag, i.value);
                    }
                    break;
                default:
                    throw new ArgumentException("Invalid Statement sent for filtering");
            }

            return tagValueDictionary;
        }
    }
}
