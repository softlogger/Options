using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Options.Services;
using Options.Models;
using Newtonsoft.Json;

namespace Options.Controllers
{
    public class HomeController : Controller
    {
        IOptionService _optionService;
        IIntrinioService _intrinioService;

        public HomeController(IOptionService optionService, IIntrinioService intrinioService)
        {
            _optionService = optionService;
            _intrinioService = intrinioService;
        }

        public IActionResult Analysis(string tickerName)
        {
            ViewModel viewModel = new ViewModel();

            var colHeaders = GetStatementColumnHeaders();

            viewModel.JsonStatementColoumnHeaders = colHeaders;

            viewModel.Report10KUrl = _intrinioService.GetReport10KUrl(tickerName);
            
            TickerContainer container = _optionService.GetNetTickerContainerFor(tickerName);

            viewModel.TickerContainer = container;

            Dictionary<int, string> HistoricalLowPrices = _intrinioService.GetHistoricalLowPrices(tickerName);

            viewModel.HistoricalLowPrices = HistoricalLowPrices;

            Dictionary<int, string> fiscalYears = _intrinioService.GetFiscalYears(tickerName);

            viewModel.FiscalYears = fiscalYears;

            Dictionary<int, Dictionary<string, Dictionary<string, string>>> Statements = _intrinioService.GetStatements(tickerName, fiscalYears);

            viewModel.Statements = Statements;

            List<List<string>> statementTable = _intrinioService.GetStatementsTable(Statements);

            viewModel.StatementTable = statementTable;

            viewModel.SetJsonStrings();

            return View("Analysis", viewModel);
        }


        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }

        public string Test(string someVal1, string someVal2)
        {
            return string.Format($"<H1> any maa nay lai jaay {someVal1} and {someVal2}</H1>");
        }


        public IActionResult Temp()
        {
            return View();
        }
        public IActionResult ExpVC(string tickerName, string expirationDate = null)
        {
            if (string.IsNullOrEmpty(tickerName)) tickerName = "MSFT";
            return ViewComponent("ExpirationWidget", new { ticker = tickerName, expirationDate = expirationDate });
        }

        public IActionResult Search()
        {
            return View();
        }

        public string GetStatementColumnHeaders()
        {
            var cols = new List<string>()
            {
                "Revenue", "EBIT", "EBITDA", "EBITDA/Revenue", "Total Liab", "Current Assets", "Wt Avg Diluted Shares", "(TLbl - Curr Ass)/Num. of Shares"
            };

            return JsonConvert.SerializeObject(cols);

        }

      

        
    }
}
