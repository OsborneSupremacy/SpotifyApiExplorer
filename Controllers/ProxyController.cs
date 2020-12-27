using System;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SpotifyApiExplorer.Interface;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SpotifyApiExplorer.Objects;

namespace SpotifyApiExplorer.Controllers
{
    [ApiController]
    [Produces("application/json")]
    public class ProxyController : Controller
    {
        private readonly ILogger<ProxyController> _logger;

        private readonly IApiRequestService _apiRequestService;

        private readonly IHttpClientFactory _httpClientFactory;

        private readonly Settings _settings;

        private readonly ITokenService _tokenService;

        public ProxyController(
            ILogger<ProxyController> logger, 
            IApiRequestService apiRequestService, 
            IHttpClientFactory httpClientFactory,
            IOptions<Settings> settings, 
            ITokenService tokenService
        )
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _apiRequestService = apiRequestService ?? throw new ArgumentNullException(nameof(apiRequestService));
            _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        }

        [HttpGet]
        [Route("proxy/{**spotifyRequest}")]
        [Produces("application/json")]
        public async Task<IActionResult> Index([FromRoute] string spotifyRequest)
        {
            var authToken = await _tokenService.GetAsync();

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {authToken.AccessToken}");

            var url = $"{_settings.SpotifyBaseUrl}/{spotifyRequest}";

            _logger.LogInformation("Making request to {url}", url);

            var result = await _apiRequestService.GetAsync(client, url);

            if (result.HasValue)
                return new OkObjectResult(result);
            else
                return new NotFoundObjectResult(spotifyRequest);
        }
    }
}
