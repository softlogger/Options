using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Options.Models;
using Newtonsoft.Json;
using System.Net;
using System.Dynamic;

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
            string startDate = (new DateTime(DateTime.Now.Year - 4, 01, 01)).ToString("yyyy-MM-dd");
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
            string report10KUrlString = "Error";

            string urlString = _urlService.Report10KUrl(ticker);

            string responseString = _netService.GetResponseFor(urlString);

            Report10K report10K = JsonConvert.DeserializeObject<Report10K>(responseString);

            if (report10K.result_count > 0)
                report10KUrlString = report10K.data.First().report_url;

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

        public List<List<string>> GetStatementsTable(Dictionary<int, Dictionary<string, Dictionary<string, string>>> statements, Dictionary<int, string> historicalLowPrices)
        {


            List<List<string>> statementTable = new List<List<string>>();

            List<string> colHeader = statements.Keys.Select(k => k.ToString()).ToList();

            colHeader.Insert(0, "");

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

            List<string> DepreciationAndAmortization = new List<string>();
            DepreciationAndAmortization.Add("Depreciation_Amortization");
            foreach (var key in statements.Keys)
            {
                var row = statements[key]["calculations"]["depreciationandamortization"];
                DepreciationAndAmortization.Add(row);
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

            List<string> BuyingPrice = new List<string>();
            BuyingPrice.Add("Buying_Price");
            int index = 1;
            foreach (var key in statements.Keys)
            {
                var lowestStock = historicalLowPrices[key];
                var lowestStockPrice = decimal.Parse(lowestStock.Split(' ')[0]);
                var LiabMinusAssets = decimal.Parse(TotalLiabilitesMinusCurrentAssets[index]);
                var numOfShares = decimal.Parse(WeightedAvgDilutedShares[index]);

                var buyingPriceRow = lowestStockPrice;// + (LiabMinusAssets / numOfShares);
                BuyingPrice.Add(buyingPriceRow.ToString("0.##"));
                index++;
            }

            List<string> CashFlowMultiple = new List<string>();
            CashFlowMultiple.Add("Cash_Flow_Multiple");
            int cfmIndex = 1;
            foreach (var key in statements.Keys)
            {
                var buyingPrice = decimal.Parse(BuyingPrice[cfmIndex]);
                var ebidta = decimal.Parse(Ebitda[cfmIndex]);
                var numOfShares = decimal.Parse(WeightedAvgDilutedShares[cfmIndex]);

                var cfm = buyingPrice / (ebidta / numOfShares);
                CashFlowMultiple.Add(cfm.ToString("0.##"));
                cfmIndex++;
            }


            List<string> EndDates = new List<string>();
            EndDates.Add("Fiscal_Year_End_Date");
            foreach (var key in statements.Keys)
            {
                var row = statements[key]["income_statement"]["end_date"];
                EndDates.Add(row);
            }


            statementTable.Add(colHeader); //years - where used?
            statementTable.Add(Revenues);
            statementTable.Add(Ebit);
            statementTable.Add(DepreciationAndAmortization);
            statementTable.Add(Ebitda);
            statementTable.Add(EbitdaPerRev);
            statementTable.Add(TotalLiabilities);
            statementTable.Add(CurrentAssets);
            statementTable.Add(TotalLiabilitesMinusCurrentAssets);
            statementTable.Add(WeightedAvgDilutedShares);


            statementTable.Add(BuyingPrice);
            statementTable.Add(CashFlowMultiple);

            statementTable.Add(EndDates);

            return statementTable;

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



        }

        public List<List<string>> GetProjectedStatementTable(List<List<string>> statementTable)
        {
            if (statementTable[0].Count() < 3) return statementTable;

            foreach (var statement in statementTable)
            {
                ProjectStatement(statement);
            }

            ProjectLiabMinusAssetsFor(statementTable);

            var fiscalYearEndDatesStatement = statementTable.Where(s => s.First() == "Fiscal_Year_End_Date").First();

            ProjectFiscalYearEndDates(fiscalYearEndDatesStatement);

            return statementTable;
        }

        public void ProjectLiabMinusAssetsFor(List<List<string>> statements)
        {
            var totLiability = statements.Where(s => s.First() == "Total_Liabilities").First();
            var currentAssets = statements.Where(s => s.First() == "Current_Assets").First();
            var totLibMinuCurrAssets = statements.Where(s => s.First() == "Total_Lbs_Minus_Assets").First();

            int index = totLibMinuCurrAssets.Count();
            totLibMinuCurrAssets.Add((Convert.ToDouble(totLiability[index]) - Convert.ToDouble(currentAssets[index])).ToString());
            totLibMinuCurrAssets.Add((Convert.ToDouble(totLiability[index + 1]) - Convert.ToDouble(currentAssets[index + 1])).ToString());

        }

        public void ProjectFiscalYearEndDates(List<string> statement)
        {
            var lastDate = DateTime.Parse(statement.Last());
            lastDate = lastDate.AddYears(1);
            statement.Add(lastDate.ToString("yyyy-MM-dd"));
            lastDate = lastDate.AddYears(1);
            statement.Add(lastDate.ToString("yyyy-MM-dd"));
        }

        public void ProjectStatement(List<string> statement)
        {
            if (statement.Count < 3) return;

            var rowIdentifier = statement[0];


            switch (rowIdentifier)
            {
                case "Total_Revenue":
                case "Ebit":
                case "Ebitda":
                case "Ebitda_Per_Revenue":
                case "Total_Liabilities":
                case "Current_Assets":
                case "Weighted_Avg_Diluted_Shares":

                    var initialValue = double.Parse(statement[1]);
                    var finalValue = double.Parse(statement[statement.Count - 1]);
                    var period = statement.Count - 1;

                    var growthRate = GetGrowthRate(initialValue, finalValue, period);
                    var nextValue = finalValue + (growthRate * finalValue);

                    var nextGrowthRate = GetGrowthRate(initialValue, nextValue, period + 1);
                    var nextTonextValue = nextValue + (nextValue * nextGrowthRate);

                    if (rowIdentifier != "Ebitda_Per_Revenue")
                    {
                        statement.Add(nextValue.ToString("0"));
                        statement.Add(nextTonextValue.ToString("0"));
                    }
                    else
                    {
                        statement.Add(nextValue.ToString("#.0"));
                        statement.Add(nextTonextValue.ToString("#.0"));
                    }
                    break;
                case "Depreciation_Amortization":
                    statement.Add("N/A");
                    statement.Add("N/A");
                    break;
                case "Total_Lbs_Minus_Assets":
                    break;
                case "Buying_Price":
                case "Cash_Flow_Multiple":
                    statement.Add(string.Empty);
                    statement.Add(string.Empty);
                    break;
                case "Fiscal_Year_End_Date":
                    break;
                case "":
                    break;

                default:
                    throw new ArgumentException("Invalid Statement Type");

            }
        }

        private double GetGrowthRate(double initial, double final, int period)
        {

            var fraction = final / initial;
            var growthRate = Math.Pow(Math.Abs(fraction), (1.0 / Convert.ToDouble(period))) - 1.0;

            if ((initial < 0 && final > 0) || (initial > 0 && final < 0))
            {
                if ((period % 2) != 0) growthRate = growthRate * -1.0;
            }

            return growthRate;
        }

        public string GetDividendInfo(string ticker)
        {
            string dividendUrl = _urlService.GetDividend(ticker);

            string dividendDataResponse = _netService.GetResponseFor(dividendUrl);

            Dividend dividend = JsonConvert.DeserializeObject<Dividend>(dividendDataResponse);

            dynamic dynamicDividend = new ExpandoObject();

            if (dividend.result_count > 0)
            {
                dynamicDividend.Date = dividend.data.First().date;
                dynamicDividend.Value = dividend.data.First().value;
                dynamicDividend.HasValue = true;
            }
            else
            {
                dynamicDividend.HasValue = false;
            }

            var dynamicJsonString = JsonConvert.SerializeObject(dynamicDividend);
            return dynamicJsonString;
            
        }

        public void Normalize(Dictionary<int, string> historicalPrices, Dictionary<int, string> fiscalYears)
        {
            if (fiscalYears.Keys.All(k => historicalPrices.Keys.Contains(k))) return;

            foreach (var key in fiscalYears.Keys)
            {
                if (historicalPrices.Keys.Contains(key)) continue;

                historicalPrices.Add(key, "0");
            }
        }
    }
}
