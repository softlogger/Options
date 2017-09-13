using Microsoft.VisualStudio.TestTools.UnitTesting;
using Options.Models;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using Options.Services;
using Options.Utility;
using System.Numerics;

namespace Options.Test
{
    [TestClass]
    public class IntrinioModelsTest
    {
        NetService NetService
        {
            get
            {
                return new NetService();
            }
        }


        public string ResponseStringFromFile(string filePath)
        {
            return File.ReadAllText(filePath);
        }

        [TestMethod]
        public void VerifyStandardizedFinancials()
        {
            string url = @"https://api.intrinio.com/fundamentals/standardized?identifier=BBBY&statement=income_statement&type=FY&date=2017-09-03";

            string responseString = NetService.GetResponseFor(url);

            StandardizedFinancial standardizedFinancial = JsonConvert.DeserializeObject<StandardizedFinancial>(responseString);

            Assert.IsTrue(standardizedFinancial.result_count > 0);
            Assert.IsTrue(standardizedFinancial.data.Count() > 0);


        }

        [TestMethod]
        public void VerifyHistoricalPrices()
        {
            string endDate = DateTime.Now.ToString("yyyy-MM-dd");
            int threesYearagoYear = DateTime.Now.Year - 3;


            string StartDate = new DateTime(threesYearagoYear, 01, 01).ToString("yyyy-MM-dd");
            string url = @"https://api.intrinio.com/prices?identifier=BBBY&start_date=2014-01-01&end_date=2017-09-03&frequency=monthly";

            string responseString = NetService.GetResponseFor(url);
            //string responseString = File.ReadAllText(@"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_A_HistoricalPrices.txt");

            HistoricalPrices historicalPrices = JsonConvert.DeserializeObject<HistoricalPrices>(responseString);

            Assert.IsTrue(historicalPrices.result_count > 0);
            Assert.IsTrue(historicalPrices.data.Count() > 0);
        }

        [TestMethod]
        public void VerifyIncomeStatement()
        {
            string url = @"https://api.intrinio.com/financials/standardized?identifier=BBBY&statement=income_statement&type=FY&fiscal_year=2016";

            string responseString = NetService.GetResponseFor(url);

            IncomeStatement incomeStatement = JsonConvert.DeserializeObject<IncomeStatement>(responseString);

            var EBIT = incomeStatement.EBIT;

            Assert.IsTrue(incomeStatement.result_count > 0);
            Assert.IsTrue(incomeStatement.data.Count() > 0);


        }

        [TestMethod]
        public void VerifyBalanceSheetStatement()
        {
            string url = @"https://api.intrinio.com/financials/standardized?identifier=BBBY&statement=balance_sheet&type=FY&fiscal_year=2016";

            string responseString = NetService.GetResponseFor(url);

            BalanceSheet balanceSheet = JsonConvert.DeserializeObject<BalanceSheet>(responseString);

            Assert.IsTrue(balanceSheet.result_count > 0);
            Assert.IsTrue(balanceSheet.data.Count() > 0);


        }

        [TestMethod]
        public void VerifyCashFlowStatement()
        {
            string url = @"https://api.intrinio.com/financials/standardized?identifier=BBBY&statement=cash_flow_statement&type=FY&fiscal_year=2016";

            string responseString = NetService.GetResponseFor(url);

            CashFlow cashFlow = JsonConvert.DeserializeObject<CashFlow>(responseString);



            Assert.IsTrue(cashFlow.result_count > 0);
            Assert.IsTrue(cashFlow.data.Count() > 0);


        }

        [TestMethod]
        public void VerifyCalculationStatement()
        {
            string url = @"https://api.intrinio.com/financials/standardized?identifier=BBBY&statement=calculations&type=FY&fiscal_year=2016";

            //string filePath =
            //    @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_A_Calculations_2016.txt";
            //string fileData = File.ReadAllText(filePath);

            string responseString = NetService.GetResponseFor(url);

            JsonSerializerSettings serializerSettings = new JsonSerializerSettings();

            serializerSettings.Error = (Object sender, Newtonsoft.Json.Serialization.ErrorEventArgs errorEventArgs) =>
            {
                var o = errorEventArgs.CurrentObject;
                var c = errorEventArgs.ErrorContext;

                c.Handled = true;
            };
            Calculation calculation = JsonConvert.DeserializeObject<Calculation>(responseString, serializerSettings);

            Assert.IsTrue(calculation.result_count > 0);
            Assert.IsTrue(calculation.data.Count() > 0);
        }

        [TestMethod]
        public void GetHistoricalLowPrices()
        {
            string endDate = DateTime.Now.ToString("yyyy-MM-dd");
            int threesYearagoYear = DateTime.Now.Year - 3;


            string StartDate = new DateTime(threesYearagoYear, 01, 01).ToString("yyyy-MM-dd");
            // string url = @"https://api.intrinio.com/prices?identifier=BBBY&start_date=2014-01-01&end_date=2017-09-03&frequency=monthly";

            string url = URL.HistoricalPricesUrl("BBBY", StartDate, endDate, "monthly");

            //string responseString = NetService.GetResponseFor(url);
            string responseString = File.ReadAllText(@"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_A_HistoricalPrices.txt");

            HistoricalPrices historicalPrices = JsonConvert.DeserializeObject<HistoricalPrices>(responseString);



            Assert.IsTrue(historicalPrices.result_count > 0);
            Assert.IsTrue(historicalPrices.data.Count() > 0);


            var historicalData = historicalPrices.data;

            var years = historicalData.Select(y => DateTime.Parse(y.date).Year).Distinct().ToList();

            Dictionary<int, decimal> leastPricePerYear = new Dictionary<int, decimal>();

            foreach (var y in years)
            {
                var leastPrice = historicalData.Where(h => DateTime.Parse(h.date).Year == y).Select(p => Convert.ToDecimal(p.low)).Min();
                leastPricePerYear.Add(y, leastPrice);
            }

            var dictSTring = JsonConvert.SerializeObject(leastPricePerYear);

            // { "2017":26.96,"2016":38.605,"2015":47.73,"2014":54.96}

            var present = Convert.ToDouble(leastPricePerYear.Values.First());
            var past = Convert.ToDouble(leastPricePerYear.Values.Last());
            var numberOfPeriod = Convert.ToDouble(leastPricePerYear.Keys.Count());
            var exp = 1.0 / numberOfPeriod;

            //growthRate= (Math.Pow((present/past), 1/num of period)) - 1;

            var growthRate = Math.Pow((present / past), exp) - 1.0;


        }



        [TestMethod]
        public void CalculateGrowthRate1()
        {
            //198920  81566 -333534

            //var finalValue = -333534000D;
            //var initialValue = 198920000D;

            var finalValue = -333534D;
            var initialValue = 198920D;
            var period = 3.0;

            var gr = CalculateGrowthRate(initialValue, finalValue, period);

            var fv = CalculateFinalValue(initialValue, gr, period);

            Assert.IsTrue((finalValue - fv) < 100);
        }

        [TestMethod]
        public void CalculateGrowthRate2()
        {
            //11,881,176,000	12,103,887,000	12,215,757,000 -7.36 %

            var initialValue = 11881176000.00;
            var finalValue = 12215757000.00;
            var period = 3.0;

            var gr = CalculateGrowthRate(initialValue, finalValue, period);

            var ans = CalculateFinalValue(initialValue, gr, period);

            Assert.IsTrue((finalValue - ans) < 10.0);
        }

        [TestMethod]
        public void CalculateGrowthRate3()
        {
            //11,881,176,000	12,103,887,000	12,215,757,000 -7.36 %

            var finalValue = 11881176000.00;
            var initialValue = 12215757000.00;
            var period = 3.0;

            var gr = CalculateGrowthRate(initialValue, finalValue, period);

            var ans = CalculateFinalValue(initialValue, gr, period);

            Assert.IsTrue((finalValue - ans) < 10.0);
        }
        [TestMethod]
        public void CalculateGrowthRate4()
        {
            //11,881,176,000	12,103,887,000	12,215,757,000 -7.36 %

            var finalValue = -11881176000.00;
            var initialValue = -12215757000.00;
            var period = 3.0;

            var gr = CalculateGrowthRate(initialValue, finalValue, period);

            var ans = CalculateFinalValue(initialValue, gr, period);

            Assert.IsTrue((finalValue - ans) < 10.0);
        }

        [TestMethod]
        public void CalculateGrowthRate5()
        {
            //11,881,176,000	12,103,887,000	12,215,757,000 -7.36 %

            var initialValue = -11881176000.00;
            var finalValue = -12215757000.00;
            var period = 3.0;

            var gr = CalculateGrowthRate(initialValue, finalValue, period);

            var ans = CalculateFinalValue(initialValue, gr, period);

            Assert.IsTrue((finalValue - ans) < 10.0);
        }

        [TestMethod]
        public void CalculateGrowthRate6()
        {
            //11,881,176,000	12,103,887,000	12,215,757,000 -7.36 %

            var initialValue = -100.00; //-11881176000.00;
            var finalValue = 200.00; //12215757000.00;
            var period = 4.0;

            var gr = CalculateGrowthRate(initialValue, finalValue, period);
            var ans = CalculateFinalValue(initialValue, gr, period);

            if (finalValue > 0) ans = Math.Abs(ans);

            Assert.IsTrue((finalValue - ans) < 10.0);
        }

         
        public double CalculateGrowthRate(double initialValue, double finalValue, double period)
        {

            if (initialValue < 0 && finalValue > 0)
            {
                var frac = finalValue / initialValue;
                var gr = Math.Pow(Math.Abs(frac), 1.0 / period);
                gr = -(gr) - 1.0;
                return gr;
            }


            var fraction = finalValue / initialValue;
            if (fraction < 0) fraction = Math.Abs(fraction);

            

            var growth = Math.Pow(fraction, 1.0D / period);

            //if finalValue < initialValue && finalValue is -ve && initialValue is +ve
            if (finalValue < 0 && finalValue < initialValue && initialValue > 0)
            {
                growth = -1.0 * growth;
            }
           

            var growthRate = growth - 1.0;

            return growthRate;

        }

        public double CalculateFinalValue(double initialValue, double growthRate, double period)
        {

            {
                for (int i = 0; i < period; i++)
                {
                    initialValue = initialValue + (initialValue * growthRate);
                }
                return initialValue;
            }
        }

        [DataRow(300.0, 100.0)]
        [DataRow(100.0, 300.0)]
        [DataRow(-300.0, -100.0)]
        [DataRow(-100.0, -300.0)]
        [DataRow(-300.0, 100.0)]
        [DataRow(-100.0, 300.0)]
        [DataRow(300.0, -100.0)]
        [DataRow(100.0, -300.0)]
        [DataRow(198920000.0, -333534000.0)]
        [TestMethod]
        public void VerifyPermutations(double i, double f)
        {

            var gr = CalculateGrowthRate(i, f, 4.0);
            var cfv = CalculateFinalValue(i, gr, 4.0);

           // if (f < 0) f = Math.Abs(f);

            Assert.IsTrue((Math.Abs(cfv - f) < 1.00), $"cfv: {cfv} f: {f}");

            //198920000.0  81566000.0  -333534000.0
        }

    }
}
