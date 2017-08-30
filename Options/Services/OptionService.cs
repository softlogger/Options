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
       
        public OptionContainer GetOptionContainerFor(string ticker, int? expirationDate)
        {
            string responseString = GetResponseString(ticker, expirationDate);
            OptionContainer optionContainer = JsonConvert.DeserializeObject<OptionContainer>(responseString);
            return optionContainer;
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
