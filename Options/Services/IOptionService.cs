using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Options.Models;

namespace Options.Services
{
    public interface IOptionService
    {
        OptionContainer GetOptionContainerFor(string ticker, int? expirationDate);
        List<OptionContainer> GetOptionContainerFor(string ticker);


    }
}
