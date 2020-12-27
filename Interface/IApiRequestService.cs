using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace SpotifyApiExplorer.Interface
{
    public interface IApiRequestService
    {
        Task<string> PostFormAsync(HttpClient httpClient, string url, List<KeyValuePair<string, string>> nameValueList);

        Task<JsonElement?> GetAsync(HttpClient httpClient, string url);
    }
}