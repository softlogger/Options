using Microsoft.VisualStudio.TestTools.UnitTesting;
using Options.Models;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace Options.Test
{
    //[TestClass]
    public class YahooModelsTest
    {

        public string ResponseStringFromFile(string filePath)
        {
            return File.ReadAllText(filePath);
        }

        public string ResponseStringFromNet(string url)
        {
            using (var httpClient = new HttpClient())
            {
                var authByteArray = Encoding.ASCII.GetBytes("cb37932f61b12276ca705a086b7075d4:8f111a1586d46b1f6a41f07ad23a66c6");
                var authString = Convert.ToBase64String(authByteArray);
                httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authString);
                httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

                var response = httpClient.GetAsync(url).Result;
                var responseString = response.Content.ReadAsStringAsync().Result;

                return responseString;
            }
        }

        //[DataRow("MSFT", "1547769600")]
        //[DataRow("MSFT", "1518739200")]
        [DataRow("LUV", "")]
        [TestMethod]
        public void VerifyOptionContainer_Net(string ticker, string expirationDate)
        {
            string baseUrl = "";

            if (string.IsNullOrEmpty(expirationDate))
            {
                baseUrl = @"https://query1.finance.yahoo.com/v7/finance/options/" + ticker;
            }
            else
            {
                baseUrl = @"https://query1.finance.yahoo.com/v7/finance/options/" + ticker + "?&date=" + expirationDate;
            }


            // 1518739200,1547769600

            //string url = @"https://query1.finance.yahoo.com/v7/finance/options/BBBY";
            // string url = @"https://query1.finance.yahoo.com/v7/finance/options/BBBY?&date=1547769600";

            Assert.IsFalse(string.IsNullOrEmpty(baseUrl));

            string responseStringFromNet = ResponseStringFromNet(baseUrl);

            OptionContainer containerFromNet = JsonConvert.DeserializeObject<OptionContainer>(responseStringFromNet);
            Assert.IsNull(containerFromNet.optionChain.error);

            List<string> expDates = containerFromNet.optionChain.result.First().expirationDates.Select(e => e.ToString()).ToList();



            foreach(var date in expDates)
            {
                string url = @"https://query1.finance.yahoo.com/v7/finance/options/" + ticker + "?&date=" + date;

                string responseString = ResponseStringFromNet(url);

                OptionContainer optionContainer = JsonConvert.DeserializeObject<OptionContainer>(responseString);

                Assert.IsNotNull(optionContainer);
                Assert.IsTrue(optionContainer.optionChain.result.First().options.Count() > 0);

            }
        }

        [DataRow(@"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain.txt")]
        [DataRow(@"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain_1547769600.txt")]
        [DataRow(@"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain_1518739200.txt")]
        [TestMethod]
        public void VerifyOptionContainer_File(string filePath)
        {
            filePath = @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain.txt";
            string responseStringFromFile = ResponseStringFromFile(filePath);

            //1518739200,1547769600

            OptionContainer containerFromFile = JsonConvert.DeserializeObject<OptionContainer>(responseStringFromFile);
            Assert.IsNull(containerFromFile.optionChain.error);


        }

        [TestMethod]
        public void ConvertStringDatesToListOfDates()
        {
            string filePath = @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain.txt";
            string responseStringFromFile = ResponseStringFromFile(filePath);

            OptionContainer containerFromFile = JsonConvert.DeserializeObject<OptionContainer>(responseStringFromFile);

            var stringDates = containerFromFile.optionChain.result.First().expirationDates.Select(dt => ConvertFrom(dt.ToString())).ToList();

        }

        public string ConvertFrom(string unixDate)
        {
            DateTime dt = new DateTime(1970, 1, 1, 0, 0, 0).AddSeconds(Convert.ToDouble(unixDate));

            String friendlyDateTime = dt.ToString("MMMM dd, yyyy");

            string unixDateFromFriendlyDateTime = (DateTime.Parse(friendlyDateTime) - new DateTime(1970, 1, 1, 0, 0, 0)).TotalSeconds.ToString();

            Assert.IsTrue(unixDate.Equals(unixDateFromFriendlyDateTime));

            return friendlyDateTime;
        }


        [TestMethod]
        public void ConvertUnixTimeStamp()
        {
            //1502409600,1503014400,1503619200,1504224000,1504828800,1505433600,1506038400,1510876800,1516320000,1518739200,1547769600
            //https://query1.finance.yahoo.com/v7/finance/options/BBBY?&date=1518739200&date=1547769600
            string unixDate = "1504828800";

            DateTime dt = new DateTime(1970, 1, 1, 0, 0, 0).AddSeconds(Convert.ToDouble(unixDate));

            String friendlyDateTime = dt.ToString("MMMM dd, yyyy");
            //String friendlyDateTime = dt.ToString("MMMM dd, yyyy HH:MM:ss tt");

            string unixDateFromFriendlyDateTime = (DateTime.Parse(friendlyDateTime) - new DateTime(1970, 1, 1, 0, 0, 0)).TotalSeconds.ToString();

            Assert.IsTrue(unixDate.Equals(unixDateFromFriendlyDateTime));
        }

        

        //[DataRow(@"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain.txt")]
        //[DataRow(@"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain_1547769600.txt")]
        //[DataRow(@"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain_1518739200.txt")]
        [TestMethod]
        public void VerifyTickerContainer()
        {
            TickerContainer tickerContainer = new TickerContainer("BBBY");

            List<string> filePaths = new List<string>()
            {
                @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain.txt",
                @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain_1547769600.txt",
                @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain_1518739200.txt"
            };

            foreach (var filePath in filePaths)
            {

                string responseStringFromFile = ResponseStringFromFile(filePath);

                //1518739200,1547769600

                OptionContainer containerFromFile = JsonConvert.DeserializeObject<OptionContainer>(responseStringFromFile);
                Assert.IsNull(containerFromFile.optionChain.error);

             
                tickerContainer.Add(containerFromFile);

                
            }

            Assert.IsTrue(tickerContainer.ContainerDictionary.Count > 0);
            Assert.IsTrue(tickerContainer.ExpirationDates.Count > 0);
            Assert.IsTrue(tickerContainer.Strikes.Count > 0);


            if (tickerContainer.ContainerDictionary.Count == 3)
            {
                tickerContainer.SetJsonStrings();
                var t = tickerContainer;
            }
        }
    }
}
