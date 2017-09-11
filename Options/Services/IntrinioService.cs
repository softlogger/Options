using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Options.Models;
using Newtonsoft.Json;
using System.Net;

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



                leastPricePerYear.Add(y, leastPrice + " " + leastPriceDate.date);
            }

            // var dictSTring = JsonConvert.SerializeObject(leastPricePerYear);

            // { "2017":26.96,"2016":38.605,"2015":47.73,"2014":54.96}
            return leastPricePerYear;

        }

        public string GetReport10KUrl(string ticker)
        {
            string urlString = _urlService.Report10KUrl(ticker);

            string responseString = _netService.GetResponseFor(urlString);

            Report10K report10K = JsonConvert.DeserializeObject<Report10K>(responseString);

            string report10KUrlString = report10K.data.First().report_url;

           // var encodedUrl = WebUtility.HtmlEncode(report10KUrlString);

            return report10KUrlString;
        }

        public Dictionary<int, string> GetFiscalYears(string ticker)
        {
            string todaysDate = DateTime.Now.ToString("yyyy-MM-dd");

            string url = $"https://api.intrinio.com/fundamentals/standardized?identifier={ticker}&statement=income_statement&type=FY&date={todaysDate}";

            string responseString = _netService.GetResponseFor(url);

            StandardizedFinancial standardizedFinancial = JsonConvert.DeserializeObject<StandardizedFinancial>(responseString);

            Func<int> numOfYears = () =>
            {
                if (standardizedFinancial.data.Count() >= 3) return 3;
                if (standardizedFinancial.data.Count() >= 2) return 2;
                return 1;
            };

            

            Dictionary<int, string> fiscalYears = standardizedFinancial.data.Take(numOfYears()).Select(d => new { d.fiscal_year, d.end_date }).ToDictionary(t => t.fiscal_year, t => t.end_date);

            //Sorted dictionary
            Dictionary<int, string> fiscalYearsSorted = fiscalYears.OrderBy(d => d.Key).ToDictionary(d => d.Key, d => d.Value);

            return fiscalYearsSorted;
        }

        public Dictionary<int, Dictionary<string, Dictionary<string, string>>> GetStatements(string ticker, Dictionary<int, string> fiscalYears)
        {

            Dictionary<int, Dictionary<string, Dictionary<string, string>>> Dict = new Dictionary<int, Dictionary<string, Dictionary<string, string>>>();

            foreach (var sf in fiscalYears.Keys)
            {
                var year = sf;

                var statementDictionary = new Dictionary<string, Dictionary<string, string>>();

                foreach (var statement in STATEMENTS)
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

            Dictionary<string, string> filteredResponse = Filter(statement, response);

            return filteredResponse;
        }

        public Dictionary<string, string> Filter(string statement, string response)
        {
            Dictionary<string, string> tagValueDictionary = new Dictionary<string, string>();

            switch (statement)
            {
                case "income_statement":
                    IncomeStatement incomeStatement = JsonConvert.DeserializeObject<IncomeStatement>(response);
                    foreach (var i in incomeStatement.data)
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

        public List<List<string>> GetStatementsTable(Dictionary<int, Dictionary<string, Dictionary<string, string>>> statements)
        {
            var cols = new List<string>()
            {
                "Revenue", "EBIT", "EBITDA", "EBITDA_Per_Revenue", "Total Liab", "Current Assets", "Wt Avg Diluted Shares", "(TLbl - Curr Ass)/Num. of Shares"
            };

            List<List<string>> statementTable = new List<List<string>>();

            List<string> colHeader = statements.Keys.Select(k => k.ToString()).ToList();
            
            colHeader.Insert(0, string.Empty);
            

            List<string> Revenues = new List<string>();
            Revenues.Add("Total_Revenue");
            foreach (var key in statements.Keys)
            {
                var row = statements[key]["income_statement"]["totalrevenue"];
                Revenues.Add(row);
            }
            

            List<string> Ebit = new List<string>();
            Ebit.Add("Ebit");
            foreach (var key in statements.Keys)
            {
                var row = statements[key]["calculations"]["ebit"];
                Ebit.Add(row);
            }
            

            List<string> Ebitda = new List<string>();
            Ebitda.Add("Ebitda");
            foreach (var key in statements.Keys)
            {
                var row = statements[key]["calculations"]["ebitda"];
                Ebitda.Add(row);
            }
            

            List<string> EbitdaPerRev = new List<string>();
            EbitdaPerRev.Add("Ebitda_Per_Revenue");
            foreach (var key in statements.Keys)
            {
                var row = statements[key]["calculations"]["ebitdamargin"];
                EbitdaPerRev.Add(row);
            }
           

            List<string> TotalLiabilities = new List<string>();
            TotalLiabilities.Add("Total_Liabilities");

            List<string> CurrentAssets = new List<string>();
            CurrentAssets.Add("Current_Assets");

            List<string> TotalLiabilitesMinusCurrentAssets = new List<string>();
            TotalLiabilitesMinusCurrentAssets.Add("Total_Lbs_Minus_Assets");


            foreach (var key in statements.Keys)
            {
                var totLblRow = statements[key]["balance_sheet"]["totalliabilities"];
                var currentAssRow = statements[key]["balance_sheet"]["totalcurrentassets"];
                var totLblRowMinusCurrentAssRow = (decimal.Parse(totLblRow) - decimal.Parse(currentAssRow)).ToString();
                TotalLiabilities.Add(totLblRow);
                CurrentAssets.Add(currentAssRow);
                TotalLiabilitesMinusCurrentAssets.Add(totLblRowMinusCurrentAssRow);
            }


         
            //weightedavedilutedsharesos

            List<string> WeightedAvgDilutedShares = new List<string>();
            WeightedAvgDilutedShares.Add("Weighted_Avg_Diluted_Shares");
            foreach (var key in statements.Keys)
            {
                var row = statements[key]["income_statement"]["weightedavedilutedsharesos"];
                WeightedAvgDilutedShares.Add(row);
            }

            //freecashflow

            List<string> FreeCashFlow = new List<string>();
            FreeCashFlow.Add("Free_Cash_Flow");
            foreach (var key in statements.Keys)
            {
                var row = statements[key]["calculations"]["freecashflow"];
                FreeCashFlow.Add(row);
            }
            
            statementTable.Add(colHeader);
            statementTable.Add(Revenues);
            statementTable.Add(Ebit);
            statementTable.Add(Ebitda);
            statementTable.Add(EbitdaPerRev);
            statementTable.Add(TotalLiabilities);
            statementTable.Add(CurrentAssets);
            statementTable.Add(TotalLiabilitesMinusCurrentAssets);
            statementTable.Add(WeightedAvgDilutedShares);
            statementTable.Add(FreeCashFlow);

            /*
Inc State "income_statement"
Revenue - totalrevenue
Ebit - totaloperatingincome
Int exp - totalinterestincome
Wt avg diluted shares - weightedavedilutedsharesos

Bal Sheet balance_sheet
Total Liab - totalliabilities
Total curr assets - totalcurrentassets

Cash Flow cash_flow
Depreciation - depreciationexpense

Self Calc


Reported Calc calculations
{
      "tag": "freecashflow",
      "value": 474483805.1
    },
{
      "tag": "ebit",
      "value": 1135210000
    },
    {
      "tag": "depreciationandamortization",
      "value": 290914000
    },
    {
      "tag": "ebitda",
      "value": 1426124000
    },
ebitda/revenue
{
      "tag": "ebitdamargin",
      "value": 0.116745
    },


*/


            return statementTable;
        }
    }
}
