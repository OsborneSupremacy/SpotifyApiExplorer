using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SpotifyApiExplorer.Interface;
using System.Threading.Tasks;
using System.Text.Json;
using SpotifyApiExplorer.Objects;

namespace SpotifyApiExplorer.Services
{
    public class TokenService : ITokenService
    {
        private readonly ILogger<ITokenService> _logger;

        private readonly IApiRequestService _apiRequestService;

        private readonly IHttpClientFactory _httpClientFactory;

        private readonly IDateTimeProvider _dateTimeProvider;

        private readonly Settings _settings;

        private Token _token;

        private Task<Token> _tokenTask;

        private readonly object _tokenTaskLocker = new object();

        public TokenService(
            ILogger<ITokenService> logger,
            IOptions<Settings> settings,
            IApiRequestService apiRequestService,
            IHttpClientFactory httpClientFactory,
            IDateTimeProvider dateTimeProvider
            )
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
            _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
            _apiRequestService = apiRequestService ?? throw new ArgumentNullException(nameof(apiRequestService));
            _dateTimeProvider = dateTimeProvider ?? throw new ArgumentNullException(nameof(dateTimeProvider));
        }

        public async Task<Token> GetAsync()
        {
            if (_token != null && _token.ExpirationDate > _dateTimeProvider.GetCurrentDateTime()) {
                _logger.LogInformation("Valid token found");
                return _token;
            }

            lock (_tokenTaskLocker)
            {
                switch (_tokenTask?.Status ?? TaskStatus.RanToCompletion)
                {
                    case TaskStatus.RanToCompletion:
                    case TaskStatus.Canceled:
                    case TaskStatus.Faulted: // create new task for these statuses
                        _tokenTask = GetTokenAsync();
                        break;
                    default: // use current task
                        break;
                }
            }
            return await _tokenTask;
        }

        private async Task<Token> GetTokenAsync()
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Basic {GetUserNameAndPasswordBase64(_settings.ApiKeys.ClientId, _settings.ApiKeys.ClientSecret)}");

            var startTime = _dateTimeProvider.GetCurrentDateTime();

            var response = await _apiRequestService.PostFormAsync(client, _settings.TokenUrl,
                new List<KeyValuePair<string, string>>()
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials")
                }
            );

            _token = JsonSerializer.Deserialize<Token>(response);

            _token.ExpirationDate = startTime.AddSeconds(_token.ExpiresIn);
            return _token;
        }

        public string GetUserNameAndPasswordBase64(string clientID, string clientSecret)
        {
            var apiKeysBytes = Encoding.ASCII.GetBytes($"{clientID}:{clientSecret}");
            return Convert.ToBase64String(apiKeysBytes);
        }
    }
}
