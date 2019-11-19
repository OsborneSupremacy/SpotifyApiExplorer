using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SpotifyApiExplorer.Objects;
using SpotifyApiExplorer.Interface;

namespace SpotifyApiExplorer.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TokenController : Controller
    {
        private readonly ILogger<TokenController> _logger;

        private readonly IApiRequestService _apiRequestService;

        private readonly Settings _settings;

        public TokenController(ILogger<TokenController> logger, IOptions<Settings> settings, IApiRequestService apiRequestService)
        {
            _logger = logger;
            _settings = settings.Value;
            _apiRequestService = apiRequestService;
        }

        [HttpGet]
        public Token Get()
        {
            var postClient = new HttpClient();
            postClient.DefaultRequestHeaders.Add("Authorization", $"Basic {GetUserNameAndPasswordBase64(_settings.ApiKeys.ClientId, _settings.ApiKeys.ClientSecret)}");

            var url = "https://accounts.spotify.com/api/token";

            return JsonConvert.DeserializeObject<Token>
                (_apiRequestService.PostForm(postClient, url,
                new List<KeyValuePair<string, string>>() { new KeyValuePair<string, string>("grant_type", "client_credentials") })
                .GetAwaiter()
                .GetResult());
        }

        public string GetUserNameAndPasswordBase64(string clientID, string clientSecret)
        {
            var apiKeysBytes = Encoding.ASCII.GetBytes($"{clientID}:{clientSecret}");
            return Convert.ToBase64String(apiKeysBytes);
        }
    }
}