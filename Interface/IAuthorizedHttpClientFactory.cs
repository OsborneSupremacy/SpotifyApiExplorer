using System.Net.Http;
using System.Threading.Tasks;

namespace SpotifyApiExplorer.Interface
{
    public interface IAuthorizedHttpClientFactory
    {
        Task<HttpClient> CreateClientAsync();
    }
}
