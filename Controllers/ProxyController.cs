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

        private readonly Settings _settings;

        public ProxyController(
            ILogger<ProxyController> logger, 
            IApiRequestService apiRequestService, 
            IOptions<Settings> settings
        )
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _apiRequestService = apiRequestService ?? throw new ArgumentNullException(nameof(apiRequestService));
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
        }

        [HttpGet]
        [Route("proxy/{**request}")]
        [Produces("application/json")]
        public async Task<IActionResult> Index([FromRoute] string request, [FromQuery] string queryString)
        {
            var url = $"{_settings.SpotifyBaseUrl}/{request}{queryString}";

            _logger.LogInformation("Making request to {url}", url);

            var result = await _apiRequestService.GetAsync(url);

            if (result.HasValue)
                return new OkObjectResult(result);
            else
                return new NotFoundObjectResult(request);
        }
    }
}
