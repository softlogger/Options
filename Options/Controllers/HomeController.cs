using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Options.Services;
using Options.Models;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;

namespace Options.Controllers
{
    public class HomeController : Controller
    {
        IOptionService _optionService;
        IIntrinioService _intrinioService;
        ILogger<HomeController> _logger;

        public HomeController(IOptionService optionService, IIntrinioService intrinioService, ILogger<HomeController> logger)
        {
            _optionService = optionService;
            _intrinioService = intrinioService;
            _logger = logger;
        }

        public IActionResult Analysis(string tickerName)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();

            _logger.LogInformation($"**** {this.ControllerContext.ActionDescriptor.ControllerName} {this.ControllerContext.ActionDescriptor.ActionName} for ticker {tickerName} connection from {ipAddress}");

            if (string.IsNullOrEmpty(tickerName)) return View(null);

            tickerName = tickerName.ToUpper().Trim();

            ViewModel viewModel = new ViewModel();

            string dividendJsonString = _intrinioService.GetDividendInfo(tickerName);

            viewModel.JsonDividendInfo = dividendJsonString;

            viewModel.Report10KUrl = _intrinioService.GetReport10KUrl(tickerName);
            
            TickerContainer container = _optionService.GetNetTickerContainerFor(tickerName);

            if (container == null) return View();

            viewModel.TickerContainer = container;

            Dictionary<int, string> HistoricalLowPrices = _intrinioService.GetHistoricalLowPrices(tickerName);

            viewModel.HistoricalLowPrices = HistoricalLowPrices;

            Dictionary<int, string> fiscalYears = _intrinioService.GetFiscalYears(tickerName);

            viewModel.FiscalYears = fiscalYears;

            _intrinioService.Normalize(HistoricalLowPrices, fiscalYears);

            Dictionary<int, Dictionary<string, Dictionary<string, string>>> Statements = _intrinioService.GetStatements(tickerName, fiscalYears);

           

            viewModel.Statements = Statements;

            List<List<string>> statementTable = _intrinioService.GetStatementsTable(Statements, HistoricalLowPrices);

            List<List<string>> projectedStatementTable = _intrinioService.GetProjectedStatementTable(statementTable);

            // viewModel.StatementTable = statementTable;
            viewModel.StatementTable = projectedStatementTable;

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

        
      

        
    }
}
