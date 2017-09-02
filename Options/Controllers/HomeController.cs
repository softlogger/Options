﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Options.Services;
using Options.Models;

namespace Options.Controllers
{
    public class HomeController : Controller
    {
        IOptionService _optionService;

       // public HomeController() { }

        public HomeController(IOptionService optionService)
        {
            _optionService = optionService;
        }

        public IActionResult Analysis(string tickerName)
        {
            //OptionService optionService = new OptionService();
            //TickerContainer container = optionService.GetTickerContainerFor(tickerName);
            TickerContainer container = _optionService.GetNetTickerContainerFor(tickerName);
            return View("Analysis", container);
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