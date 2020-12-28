using System.Text.Json;
using System.Threading.Tasks;

namespace SpotifyApiExplorer.Interface
{
    public interface IApiRequestService
    {
        Task<JsonElement?> GetAsync(string url);
    }
}