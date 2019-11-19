using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace SpotifyApiExplorer.Interface
{
    public interface IApiRequestService
    {
        Task<string> PostForm(HttpClient httpClient, string url, List<KeyValuePair<string, string>> nameValueList);
    }
}