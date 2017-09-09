using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Options.Models;
using System.Net.Http;
using Newtonsoft.Json;
using System.IO;

namespace Options.Services
{
    public class OptionService : IOptionService
    {

        INetService _netService;

        public OptionService() { }

        public OptionService(INetService netService)
        {
            _netService = netService;
        }

        public TickerContainer GetNetTickerContainerFor(string ticker)
        {
            string responseString = "";
            responseString = _netService.GetResponseFor(GetURLFor(ticker));
            OptionContainer container = JsonConvert.DeserializeObject<OptionContainer>(responseString);
           // int[] expDates = container.optionChain.result.First().expirationDates.Skip(1).OrderByDescending(dt => dt).Take(3).OrderBy(dt => dt).ToArray();
            int[] expDates = container.optionChain.result.First().expirationDates.Skip(1).Take(2).ToArray();
            List<OptionContainer> containers = new List<OptionContainer>();
            containers.Add(container);
            foreach(var xDate in expDates)
            {
                responseString = _netService.GetResponseFor(GetURLFor(ticker, xDate));
                containers.Add(JsonConvert.DeserializeObject<OptionContainer>(responseString));
            }

            TickerContainer tickerContainer = new TickerContainer();
            foreach(var c in containers)
            {
                tickerContainer.Add(c);
            }
            tickerContainer.SetJsonStrings();
            return tickerContainer;
        }


        public string GetURLFor(string ticker)
        {

            string baseUrl = @"https://query1.finance.yahoo.com/v7/finance/options/";
            return baseUrl + ticker;
           
            //    baseUrl = @"https://query1.finance.yahoo.com/v7/finance/options/" + ticker + "?&date=" + expirationDate;
           
        }

        public string GetURLFor(string ticker, int? expirationDate)
        {
            string baselineUrl = GetURLFor(ticker);
            return baselineUrl + "?&date=" + expirationDate;
        }

        public OptionContainer GetOptionContainerFor(string ticker, int? expirationDate)
        {
            string responseString = GetResponseString(ticker, expirationDate);
            OptionContainer optionContainer = JsonConvert.DeserializeObject<OptionContainer>(responseString);
            return optionContainer;
        }

        public TickerContainer GetTickerContainerFor(string ticker)
        {
            var listOfContainer = GetOptionContainerFor(ticker);
            TickerContainer container = new TickerContainer(listOfContainer.First().optionChain.result.First().underlyingSymbol.ToUpper());
            foreach(OptionContainer cont in listOfContainer)
            {
                container.Add(cont);
            }

            container.SetJsonStrings();
            return container;
        }

        public List<OptionContainer> GetOptionContainerFor(string ticker)
        {
            List <int?> expirationDates = new List<int?>() { null, 1518739200, 1547769600 };
            List<OptionContainer> containers = new List<OptionContainer>();

            foreach(var date in expirationDates)
            {
                var responseString = GetResponseString(ticker, date);
                containers.Add(JsonConvert.DeserializeObject<OptionContainer>(responseString));
            }

            return containers;
        }

        public string GetResponseString(string ticker, int? expirationDate)
        {
            
            string responseString = "";
               

            //1516320000,1518739200,1547769600
            if (ticker.ToUpper().Equals("BBBY"))
            {
                if (expirationDate == null)
                {
                    responseString = @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain.txt";
                }

                if (expirationDate == 1547769600)
                {
                    responseString = @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain_1547769600.txt";
                }

                if (expirationDate == 1518739200)
                {
                    responseString = @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\BBBY_OptionChain_1518739200.txt";
                }
                
            }

            if (ticker.ToUpper().Equals("MSFT"))
            {
                if (expirationDate == null)
                {
                    responseString = @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\MSFT_OptionChain.txt";
                }

                if (expirationDate == 1547769600)
                {
                    responseString = @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\MSFT_OptionChain_1547769600.txt";
                }

                if (expirationDate == 1518739200)
                {
                    responseString = @"C:\Users\Paresh\Documents\FileTransfer\Intrinio\MSFT_OptionChain_1518739200.txt";
                }
            }




            return File.ReadAllText(responseString);
        }
    }
}
