using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Options.Models
{
    public class TickerContainer
    {
        string _ticker;
        
        List<int> _expirationDates = new List<int>();
        Dictionary<int, float[]> _strikes = new Dictionary<int, float[]>();
        Dictionary<int, Dictionary<float, Call>> _ContainerDictionary = new Dictionary<int, Dictionary<float, Call>>();
        Dictionary<int, Dictionary<float, Put>> _PutContainerDictionary = new Dictionary<int, Dictionary<float, Put>>();


        public TickerContainer(string ticker)
        {
            _ticker = ticker;
        }

        public TickerContainer()
        {
           
        }

        public string Ticker { get => _ticker; set => _ticker = value; }
        public List<int> ExpirationDates { get => _expirationDates; set => _expirationDates = value; }
        public Dictionary<int, float[]> Strikes { get => _strikes; set => _strikes = value; }
        public Dictionary<int, Dictionary<float, Call>> ContainerDictionary { get => _ContainerDictionary; set => _ContainerDictionary = value; }

        public Dictionary<int, Dictionary<float, Put>> PutContainerDictionary { get => _PutContainerDictionary; set => _PutContainerDictionary = value; }


        public void Add(OptionContainer optionContainer)
        {
            int expDate = optionContainer.optionChain.result.First().options.First().expirationDate;

            if (_expirationDates.Contains(expDate)) throw new ArgumentException($"Expiration Date {expDate} exists ");

            _expirationDates.Add(expDate);

            float[] strikes = optionContainer.optionChain.result.First().options.First().calls.Select(c => c.strike).ToArray();

            _strikes.Add(expDate, strikes);

            _ContainerDictionary.Add(expDate, new Dictionary<float, Call>());
            _PutContainerDictionary.Add(expDate, new Dictionary<float, Put>());

            foreach(var strike in strikes)
            {
               Call call = optionContainer.optionChain.result.First().options.First().calls.Where(c => c.strike == strike).First();
                _ContainerDictionary[expDate].Add(strike, call);

                Put put = optionContainer.optionChain.result.First().options.First().puts.Where(c => c.strike == strike).FirstOrDefault();
                _PutContainerDictionary[expDate].Add(strike, put);
            }

            JsonQuoteObject = JsonConvert.SerializeObject(optionContainer.optionChain.result.First().quote);
        }
        

        public void SetJsonStrings()
        {
            JsonExpirationDatesArray = JsonConvert.SerializeObject(ExpirationDates);
            JsonStrikesDictionary = JsonConvert.SerializeObject(Strikes);
            JsonCallDictionary = JsonConvert.SerializeObject(ContainerDictionary);
            JsonPutDictionary = JsonConvert.SerializeObject(PutContainerDictionary);
        }

        public string JsonExpirationDatesArray { get; set; }
        public string JsonStrikesDictionary { get; set; }

        public string JsonCallDictionary { get; set; }
        
        public string JsonQuoteObject { get; set; }

        public string JsonPutDictionary { get; set; }
    }
}
