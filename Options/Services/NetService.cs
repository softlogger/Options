using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Options.Services
{
    public class NetService : INetService
    {
        public string GetResponseFor(string url)
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
    }
}
