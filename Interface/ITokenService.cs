using SpotifyApiExplorer.Objects;
using System.Threading.Tasks;

namespace SpotifyApiExplorer.Interface
{
    public interface ITokenService
    {
        Task<Token> GetAsync();
    }
}
