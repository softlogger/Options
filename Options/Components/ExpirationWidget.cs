using Microsoft.AspNetCore.Mvc;
using Options.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Options.Components
{
    public class ExpirationWidget : ViewComponent
    {
        IOptionService _OptionService;

        public ExpirationWidget(IOptionService optionService)
        {
            _OptionService = optionService;
        }

        public async Task<IViewComponentResult> InvokeAsync(string ticker, int? expirationDate)
        {
            return await Task.FromResult<IViewComponentResult>(View(_OptionService.GetOptionContainerFor(ticker, expirationDate)));

            //var view = View(_OptionService.GetOptionContainerFor(expirationDate));

           // return view;
        }
    }
}
