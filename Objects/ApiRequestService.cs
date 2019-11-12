using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace SpotifyApiExplorer.Objects
{
    public class ApiRequestService
    {
        public ApiRequestService()
        {
        }       

        public async Task<string> PostForm(HttpClient httpClient, string url, List<KeyValuePair<string, string>> nameValueList)
        {
            using (var httpRequest = new HttpRequestMessage(HttpMethod.Post, url))
            {
                httpRequest.Content = new FormUrlEncodedContent(nameValueList);
                using (var response = await httpClient.SendAsync(httpRequest))
                {
                    response.EnsureSuccessStatusCode();
                    return await response.Content.ReadAsStringAsync();
                }
            }
        }
    }
}
