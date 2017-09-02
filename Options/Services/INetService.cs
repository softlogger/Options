using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net;
namespace Options.Services
{
    public interface INetService
    {
        string GetResponseFor(string url);
        
    }
}
